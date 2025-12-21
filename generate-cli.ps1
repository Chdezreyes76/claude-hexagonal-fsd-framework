# Script para generar todos los archivos del CLI Tool

$baseDir = "C:\Users\Carlos.Hernandez\Proyectos\claude-hexagonal-fsd-framework"

Write-Host "Generando archivos del CLI Tool..." -ForegroundColor Green

# 1. cli/lib/utils.js
$utilsContent = @'
const path = require('path');

/**
 * Convierte un string a diferentes formatos de naming
 */
function generateNamingVariants(name) {
  // PascalCase: "My Project" -> "MyProject"
  const pascalCase = name
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // snake_case: "My Project" -> "my_project"
  const snakeCase = name
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  // kebab-case: "My Project" -> "my-project"
  const kebabCase = name
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return {
    original: name,
    pascal: pascalCase,
    snake: snakeCase,
    kebab: kebabCase
  };
}

/**
 * Genera el nombre de base de datos desde el nombre del proyecto
 */
function generateDbName(projectName, dbType = 'mysql') {
  const naming = generateNamingVariants(projectName);
  return `${naming.snake}_dev`;
}

/**
 * Valida email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida puerto
 */
function isValidPort(port) {
  const num = parseInt(port);
  return !isNaN(num) && num >= 1 && num <= 65535;
}

module.exports = {
  generateNamingVariants,
  generateDbName,
  isValidEmail,
  isValidPort
};
'@

Set-Content "$baseDir\cli\lib\utils.js" -Value $utilsContent -Encoding UTF8
Write-Host "  Created: cli/lib/utils.js" -ForegroundColor Cyan

# 2. cli/lib/config-generator.js
$configGenContent = @'
const { generateNamingVariants, generateDbName } = require('./utils');

/**
 * Genera claude.config.json desde las respuestas del wizard
 */
function generateConfig(answers, defaults) {
  const naming = generateNamingVariants(answers.projectName);
  const dbName = answers.dbName || generateDbName(answers.projectName, answers.dbType);

  const config = {
    version: '1.0.0',
    frameworkVersion: '1.0.0',
    lastUpdated: new Date().toISOString(),

    project: {
      name: answers.projectName,
      nameSnake: naming.snake,
      nameKebab: naming.kebab,
      description: answers.description || '',
      version: answers.projectVersion || '1.0.0'
    },

    team: {
      owner: {
        name: answers.userName || '',
        email: answers.userEmail
      },
      github: {
        owner: answers.githubOwner || '',
        repo: answers.githubRepo || naming.kebab,
        mainBranch: answers.mainBranch || 'main'
      }
    },

    stack: {
      backend: {
        language: defaults.stack.backend.language,
        version: defaults.stack.backend.version,
        framework: defaults.stack.backend.framework,
        architecture: defaults.stack.backend.architecture,
        dirName: answers.backendDir || defaults.stack.backend.dirName,
        port: parseInt(answers.backendPort) || defaults.stack.backend.port
      },
      frontend: {
        language: defaults.stack.frontend.language,
        framework: defaults.stack.frontend.framework,
        version: defaults.stack.frontend.version,
        architecture: defaults.stack.frontend.architecture,
        dirName: answers.frontendDir || defaults.stack.frontend.dirName,
        port: parseInt(answers.frontendPort) || defaults.stack.frontend.port
      },
      database: {
        type: answers.dbType || defaults.stack.database.type,
        version: answers.dbType === 'postgresql' ? '15' : defaults.stack.database.version,
        name: dbName,
        port: parseInt(answers.dbPort) || defaults.stack.database.port,
        migrations: defaults.stack.database.migrations
      }
    },

    domains: {
      examples: answers.domains || [],
      namingConvention: defaults.domains.namingConvention
    },

    paths: defaults.paths,

    qa: {
      enabled: answers.qaEnabled !== false,
      emailReports: answers.qaEmailReports === true,
      emailConfig: {
        from: `qa-bot@${naming.kebab}.local`,
        to: answers.userEmail,
        service: answers.qaEmailReports ? 'smtp' : 'log'
      },
      localReportPath: defaults.qa.localReportPath
    },

    workflows: {
      autoImplement: answers.autoImplement !== false,
      autoReview: answers.autoReview !== false,
      autoMerge: answers.autoMerge === true,
      requireTests: answers.requireTests === true
    },

    customization: defaults.customization
  };

  return config;
}

module.exports = { generateConfig };
'@

Set-Content "$baseDir\cli\lib\config-generator.js" -Value $configGenContent -Encoding UTF8
Write-Host "  Created: cli/lib/config-generator.js" -ForegroundColor Cyan

# 3. cli/lib/template-processor.js
$templateProcContent = @'
const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');

/**
 * Procesa un archivo template reemplazando variables {{variable}}
 */
function processTemplate(content, config) {
  // Aplanar el config para Mustache
  const view = {
    projectName: config.project.name,
    projectNameSnake: config.project.nameSnake,
    projectNameKebab: config.project.nameKebab,
    projectDescription: config.project.description,
    projectVersion: config.project.version,

    userName: config.team.owner.name,
    userEmail: config.team.owner.email,
    githubOwner: config.team.github.owner,
    githubRepo: config.team.github.repo,

    pythonVersion: config.stack.backend.version,
    backendFramework: config.stack.backend.framework,
    backendRoot: config.paths.backend.root,
    backendPort: config.stack.backend.port,

    frontendFramework: config.stack.frontend.framework,
    frontendVersion: config.stack.frontend.version,
    frontendRoot: config.paths.frontend.root,
    frontendPort: config.stack.frontend.port,

    dbType: config.stack.database.type,
    dbVersion: config.stack.database.version,
    dbName: config.stack.database.name,
    dbPort: config.stack.database.port,
    dbUser: config.project.nameSnake,

    qaEnabled: config.qa.enabled,
    qaEmailReports: config.qa.emailReports,

    // Helpers para listas
    domains: config.domains.examples
  };

  return Mustache.render(content, view);
}

/**
 * Procesa todos los archivos .tmpl en un directorio
 */
async function processAllTemplates(claudeDir, config) {
  const filesToProcess = [
    'core/settings.json.tmpl',
    'core/skills/qa-review-done/email-config.json.example'
  ];

  for (const file of filesToProcess) {
    const filePath = path.join(claudeDir, file);

    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      const processed = processTemplate(content, config);

      // Remover .tmpl de la extensión
      const outputPath = filePath.replace(/\.tmpl$/, '');
      await fs.writeFile(outputPath, processed, 'utf-8');
    }
  }
}

module.exports = {
  processTemplate,
  processAllTemplates
};
'@

Set-Content "$baseDir\cli\lib\template-processor.js" -Value $templateProcContent -Encoding UTF8
Write-Host "  Created: cli/lib/template-processor.js" -ForegroundColor Cyan

Write-Host "`nArchivos CLI generados exitosamente!" -ForegroundColor Green
Write-Host "Proximos archivos a crear: validator.js, init.js, index.js" -ForegroundColor Yellow
'@
