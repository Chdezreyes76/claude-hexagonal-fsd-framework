const fs = require('fs-extra');
const path = require('path');

/**
 * Detecta si un proyecto ya tiene el framework instalado
 */
async function isFrameworkInstalled(projectRoot) {
  const claudeDir = path.join(projectRoot, '.claude');
  const configFile = path.join(claudeDir, 'claude.config.json');

  if (await fs.pathExists(configFile)) {
    try {
      const config = await fs.readJson(configFile);
      return {
        installed: true,
        version: config.frameworkVersion,
        projectType: config.projectType || 'unknown'
      };
    } catch (error) {
      return { installed: true, version: 'unknown', projectType: 'unknown' };
    }
  }

  return { installed: false };
}

/**
 * Detecta la estructura del backend
 */
async function detectBackend(projectRoot) {
  const result = {
    exists: false,
    dirName: null,
    framework: null,
    language: null,
    version: null,
    orm: null,
    migrations: null,
    hasCore: false,
    hasDomain: false,
    hasAdapter: false,
    port: null
  };

  // Buscar directorio backend (puede tener diferentes nombres)
  const possibleDirs = ['backend', 'api', 'server', 'app'];

  for (const dir of possibleDirs) {
    const backendPath = path.join(projectRoot, dir);
    if (await fs.pathExists(backendPath)) {
      result.exists = true;
      result.dirName = dir;

      // Detectar Python/FastAPI
      const mainPy = path.join(backendPath, 'main.py');
      const requirementsTxt = path.join(backendPath, 'requirements.txt');

      if (await fs.pathExists(mainPy)) {
        result.language = 'python';

        try {
          const content = await fs.readFile(mainPy, 'utf-8');

          // Detectar FastAPI
          if (content.includes('FastAPI') || content.includes('from fastapi')) {
            result.framework = 'fastapi';

            // Intentar detectar puerto
            const portMatch = content.match(/port[=\s]+(\d+)/i) || content.match(/uvicorn\.run\([^)]*,\s*port=(\d+)/);
            if (portMatch) {
              result.port = parseInt(portMatch[1]);
            }
          }
        } catch (error) {
          // Ignorar errores de lectura
        }
      }

      // Detectar dependencias
      if (await fs.pathExists(requirementsTxt)) {
        try {
          const reqs = await fs.readFile(requirementsTxt, 'utf-8');

          // ORM
          if (reqs.includes('sqlalchemy')) result.orm = 'sqlalchemy';

          // Migraciones
          if (reqs.includes('alembic')) result.migrations = 'alembic';

          // Version de Python (si está especificada)
          const pythonMatch = reqs.match(/python[>=<]+(\d+\.\d+)/);
          if (pythonMatch) {
            result.version = pythonMatch[1];
          } else {
            result.version = '3.11'; // Default
          }
        } catch (error) {
          // Ignorar errores
        }
      }

      // Detectar estructura hexagonal
      const coreDir = path.join(backendPath, 'core');
      const domainDir = path.join(backendPath, 'domain');
      const adapterDir = path.join(backendPath, 'adapter');

      result.hasCore = await fs.pathExists(coreDir);
      result.hasDomain = await fs.pathExists(domainDir);
      result.hasAdapter = await fs.pathExists(adapterDir);

      break; // Encontramos el backend, salir del loop
    }
  }

  // Puerto por defecto si no se detectó
  if (result.exists && !result.port) {
    result.port = 8000;
  }

  return result;
}

/**
 * Detecta la estructura del frontend
 */
async function detectFrontend(projectRoot) {
  const result = {
    exists: false,
    dirName: null,
    framework: null,
    language: null,
    version: null,
    bundler: null,
    stateManagement: null,
    styling: null,
    hasFSD: false,
    port: null
  };

  // Buscar directorio frontend
  const possibleDirs = ['frontend', 'client', 'web', 'ui'];

  for (const dir of possibleDirs) {
    const frontendPath = path.join(projectRoot, dir);
    if (await fs.pathExists(frontendPath)) {
      result.exists = true;
      result.dirName = dir;

      // Leer package.json
      const packageJsonPath = path.join(frontendPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        try {
          const pkg = await fs.readJson(packageJsonPath);

          // Framework
          if (pkg.dependencies?.react) {
            result.framework = 'react';
            result.version = pkg.dependencies.react.replace(/[\^~]/, '');
          }

          // TypeScript
          if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) {
            result.language = 'typescript';
          } else {
            result.language = 'javascript';
          }

          // Bundler
          if (pkg.devDependencies?.vite) {
            result.bundler = 'vite';
          } else if (pkg.devDependencies?.webpack) {
            result.bundler = 'webpack';
          }

          // State management
          if (pkg.dependencies?.['@tanstack/react-query']) {
            result.stateManagement = 'tanstack-query';
          } else if (pkg.dependencies?.['react-query']) {
            result.stateManagement = 'react-query';
          } else if (pkg.dependencies?.redux) {
            result.stateManagement = 'redux';
          }

          // Styling
          if (pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss) {
            result.styling = 'tailwindcss';
          } else if (pkg.dependencies?.['styled-components']) {
            result.styling = 'styled-components';
          }

          // Puerto desde vite.config o package.json scripts
          const viteConfigPath = path.join(frontendPath, 'vite.config.ts');
          if (await fs.pathExists(viteConfigPath)) {
            try {
              const viteConfig = await fs.readFile(viteConfigPath, 'utf-8');
              const portMatch = viteConfig.match(/port:\s*(\d+)/);
              if (portMatch) {
                result.port = parseInt(portMatch[1]);
              }
            } catch (error) {
              // Ignorar
            }
          }
        } catch (error) {
          // Ignorar errores de lectura
        }
      }

      // Detectar Feature-Sliced Design
      const srcPath = path.join(frontendPath, 'src');
      if (await fs.pathExists(srcPath)) {
        const entities = await fs.pathExists(path.join(srcPath, 'entities'));
        const features = await fs.pathExists(path.join(srcPath, 'features'));
        const widgets = await fs.pathExists(path.join(srcPath, 'widgets'));
        const pages = await fs.pathExists(path.join(srcPath, 'pages'));

        // Si tiene al menos 3 de las 4 carpetas FSD
        const fsdCount = [entities, features, widgets, pages].filter(Boolean).length;
        result.hasFSD = fsdCount >= 3;
      }

      break; // Encontramos frontend, salir
    }
  }

  // Puerto por defecto si no se detectó
  if (result.exists && !result.port) {
    result.port = 3000;
  }

  return result;
}

/**
 * Detecta la base de datos configurada
 */
async function detectDatabase(projectRoot, backendInfo) {
  const result = {
    type: null,
    port: null,
    name: null,
    hasDocker: false
  };

  if (!backendInfo.exists) {
    return result;
  }

  const backendPath = path.join(projectRoot, backendInfo.dirName);

  // Detectar desde requirements.txt
  const requirementsTxt = path.join(backendPath, 'requirements.txt');
  if (await fs.pathExists(requirementsTxt)) {
    try {
      const reqs = await fs.readFile(requirementsTxt, 'utf-8');

      if (reqs.includes('mysqlclient') || reqs.includes('pymysql') || reqs.includes('mysql-connector')) {
        result.type = 'mysql';
        result.port = 3306;
      } else if (reqs.includes('psycopg2') || reqs.includes('postgresql')) {
        result.type = 'postgresql';
        result.port = 5432;
      } else if (reqs.includes('pyodbc') || reqs.includes('pymssql')) {
        result.type = 'sqlserver';
        result.port = 1433;
      }
    } catch (error) {
      // Ignorar
    }
  }

  // Detectar desde .env o .env.example
  const envFiles = ['.env', '.env.example', '.env.local', path.join(backendPath, '.env')];
  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, 'utf-8');

        // Detectar tipo de DB desde DATABASE_URL o similar
        if (envContent.includes('mysql://') || envContent.includes('MYSQL')) {
          result.type = result.type || 'mysql';
        } else if (envContent.includes('postgresql://') || envContent.includes('POSTGRES')) {
          result.type = result.type || 'postgresql';
        } else if (envContent.includes('sqlite')) {
          result.type = result.type || 'sqlite';
          result.port = null;
        }

        // Detectar puerto
        const portMatch = envContent.match(/DB_PORT[=\s]+(\d+)/i) ||
                         envContent.match(/DATABASE_PORT[=\s]+(\d+)/i);
        if (portMatch) {
          result.port = parseInt(portMatch[1]);
        }

        // Detectar nombre de DB
        const nameMatch = envContent.match(/DB_NAME[=\s]+([^\s\n]+)/i) ||
                         envContent.match(/DATABASE_NAME[=\s]+([^\s\n]+)/i);
        if (nameMatch) {
          result.name = nameMatch[1].replace(/['"]/g, '');
        }
      } catch (error) {
        // Ignorar
      }
    }
  }

  // Detectar desde docker-compose
  const dockerCompose = path.join(projectRoot, 'docker-compose.yml');
  if (await fs.pathExists(dockerCompose)) {
    result.hasDocker = true;

    try {
      const composeContent = await fs.readFile(dockerCompose, 'utf-8');

      if (composeContent.includes('mysql:') || composeContent.includes('image: mysql')) {
        result.type = result.type || 'mysql';
      } else if (composeContent.includes('postgres:') || composeContent.includes('image: postgres')) {
        result.type = result.type || 'postgresql';
      }
    } catch (error) {
      // Ignorar
    }
  }

  // Default a mysql si no se detectó nada
  if (!result.type) {
    result.type = 'mysql';
    result.port = 3306;
  }

  return result;
}

/**
 * Detecta si el proyecto usa Docker
 */
async function detectDocker(projectRoot) {
  const result = {
    hasDockerCompose: false,
    hasBackendDockerfile: false,
    hasFrontendDockerfile: false,
    isDevelopment: false
  };

  // Docker Compose
  const composeFiles = [
    'docker-compose.yml',
    'docker-compose.yaml',
    'docker-compose.dev.yml',
    'docker-compose.dev.yaml'
  ];

  for (const file of composeFiles) {
    const composePath = path.join(projectRoot, file);
    if (await fs.pathExists(composePath)) {
      result.hasDockerCompose = true;
      if (file.includes('dev')) {
        result.isDevelopment = true;
      }
      break;
    }
  }

  // Dockerfiles
  const backendDockerfile = path.join(projectRoot, 'backend', 'Dockerfile');
  const backendDockerfileDev = path.join(projectRoot, 'backend', 'Dockerfile.dev');
  const frontendDockerfile = path.join(projectRoot, 'frontend', 'Dockerfile');
  const frontendDockerfileDev = path.join(projectRoot, 'frontend', 'Dockerfile.dev');

  result.hasBackendDockerfile = await fs.pathExists(backendDockerfile) ||
                                 await fs.pathExists(backendDockerfileDev);
  result.hasFrontendDockerfile = await fs.pathExists(frontendDockerfile) ||
                                  await fs.pathExists(frontendDockerfileDev);

  return result;
}

/**
 * Detecta si el proyecto usa Git
 */
async function detectGit(projectRoot) {
  const gitDir = path.join(projectRoot, '.git');
  const result = {
    isGitRepo: await fs.pathExists(gitDir),
    hasGitignore: await fs.pathExists(path.join(projectRoot, '.gitignore')),
    hasGithubActions: await fs.pathExists(path.join(projectRoot, '.github', 'workflows'))
  };

  return result;
}

/**
 * Detecta dominios existentes en el backend
 */
async function detectDomains(projectRoot, backendInfo) {
  const domains = [];

  if (!backendInfo.exists || !backendInfo.hasDomain) {
    return domains;
  }

  const entitiesPath = path.join(projectRoot, backendInfo.dirName, 'domain', 'entities');

  if (await fs.pathExists(entitiesPath)) {
    try {
      const files = await fs.readdir(entitiesPath);

      for (const file of files) {
        // Ignorar __init__.py y archivos privados
        if (file === '__init__.py' || file.startsWith('_') || !file.endsWith('.py')) {
          continue;
        }

        // Extraer nombre del dominio (sin .py)
        const domainName = file.replace('.py', '');
        domains.push(domainName.toLowerCase());
      }
    } catch (error) {
      // Ignorar errores
    }
  }

  return domains;
}

/**
 * Función principal que detecta toda la estructura del proyecto
 */
async function detectProjectStructure(projectRoot) {
  // Verificar que el directorio existe
  if (!await fs.pathExists(projectRoot)) {
    throw new Error(`Project directory does not exist: ${projectRoot}`);
  }

  // Detectar si ya tiene framework instalado
  const frameworkStatus = await isFrameworkInstalled(projectRoot);

  // Detectar backend
  const backend = await detectBackend(projectRoot);

  // Detectar frontend
  const frontend = await detectFrontend(projectRoot);

  // Detectar database
  const database = await detectDatabase(projectRoot, backend);

  // Detectar Docker
  const docker = await detectDocker(projectRoot);

  // Detectar Git
  const git = await detectGit(projectRoot);

  // Detectar dominios
  const domains = await detectDomains(projectRoot, backend);

  // Determinar si es un proyecto existente válido
  const isExistingProject = backend.exists || frontend.exists;

  return {
    projectRoot,
    frameworkInstalled: frameworkStatus.installed,
    frameworkVersion: frameworkStatus.version,
    isExistingProject,
    backend,
    frontend,
    database,
    docker,
    git,
    domains,
    timestamp: new Date().toISOString()
  };
}

/**
 * Genera un resumen legible de la detección
 */
function generateDetectionSummary(detection) {
  const lines = [];

  lines.push('Project Structure Detection:');
  lines.push('');

  if (detection.frameworkInstalled) {
    lines.push(`⚠️  Framework already installed (v${detection.frameworkVersion})`);
    lines.push('');
  }

  // Backend
  if (detection.backend.exists) {
    lines.push('✓ Backend detected:');
    lines.push(`  Directory: ${detection.backend.dirName}/`);
    lines.push(`  Language: ${detection.backend.language || 'unknown'}`);
    lines.push(`  Framework: ${detection.backend.framework || 'unknown'}`);
    if (detection.backend.orm) {
      lines.push(`  ORM: ${detection.backend.orm}`);
    }
    if (detection.backend.migrations) {
      lines.push(`  Migrations: ${detection.backend.migrations}`);
    }
    lines.push(`  Port: ${detection.backend.port}`);

    if (detection.backend.hasCore || detection.backend.hasDomain || detection.backend.hasAdapter) {
      lines.push('  Hexagonal Architecture:');
      lines.push(`    - core/: ${detection.backend.hasCore ? '✓' : '✗'}`);
      lines.push(`    - domain/: ${detection.backend.hasDomain ? '✓' : '✗'}`);
      lines.push(`    - adapter/: ${detection.backend.hasAdapter ? '✓' : '✗'}`);
    }
  } else {
    lines.push('✗ Backend not found');
  }

  lines.push('');

  // Frontend
  if (detection.frontend.exists) {
    lines.push('✓ Frontend detected:');
    lines.push(`  Directory: ${detection.frontend.dirName}/`);
    lines.push(`  Framework: ${detection.frontend.framework || 'unknown'}`);
    lines.push(`  Language: ${detection.frontend.language || 'unknown'}`);
    if (detection.frontend.bundler) {
      lines.push(`  Bundler: ${detection.frontend.bundler}`);
    }
    if (detection.frontend.stateManagement) {
      lines.push(`  State: ${detection.frontend.stateManagement}`);
    }
    if (detection.frontend.styling) {
      lines.push(`  Styling: ${detection.frontend.styling}`);
    }
    lines.push(`  Port: ${detection.frontend.port}`);
    if (detection.frontend.hasFSD) {
      lines.push('  Architecture: Feature-Sliced Design ✓');
    }
  } else {
    lines.push('✗ Frontend not found');
  }

  lines.push('');

  // Database
  if (detection.database.type) {
    lines.push('✓ Database detected:');
    lines.push(`  Type: ${detection.database.type}`);
    if (detection.database.port) {
      lines.push(`  Port: ${detection.database.port}`);
    }
    if (detection.database.name) {
      lines.push(`  Name: ${detection.database.name}`);
    }
    if (detection.database.hasDocker) {
      lines.push('  Docker: ✓');
    }
  }

  lines.push('');

  // Docker
  if (detection.docker.hasDockerCompose || detection.docker.hasBackendDockerfile || detection.docker.hasFrontendDockerfile) {
    lines.push('✓ Docker detected:');
    lines.push(`  Compose: ${detection.docker.hasDockerCompose ? '✓' : '✗'}`);
    lines.push(`  Backend Dockerfile: ${detection.docker.hasBackendDockerfile ? '✓' : '✗'}`);
    lines.push(`  Frontend Dockerfile: ${detection.docker.hasFrontendDockerfile ? '✓' : '✗'}`);
    if (detection.docker.isDevelopment) {
      lines.push('  Development setup: ✓');
    }
  }

  lines.push('');

  // Git
  if (detection.git.isGitRepo) {
    lines.push('✓ Git repository detected');
    if (detection.git.hasGithubActions) {
      lines.push('  GitHub Actions: ✓');
    }
  }

  lines.push('');

  // Dominios
  if (detection.domains.length > 0) {
    lines.push('✓ Existing domains:');
    detection.domains.forEach(domain => {
      lines.push(`  - ${domain}`);
    });
  }

  return lines.join('\n');
}

module.exports = {
  detectProjectStructure,
  detectBackend,
  detectFrontend,
  detectDatabase,
  detectDocker,
  detectGit,
  detectDomains,
  isFrameworkInstalled,
  generateDetectionSummary
};
