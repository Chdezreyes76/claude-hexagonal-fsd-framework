const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs-extra');
const path = require('path');
const { isValidEmail, isValidPort } = require('./utils');

/**
 * Valida la configuración contra el JSON Schema
 */
async function validateConfig(config, schemaPath) {
  // Cargar schema
  const schema = await fs.readJson(schemaPath);

  // Crear validador Ajv
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  // Compilar schema
  const validate = ajv.compile(schema);

  // Validar
  const valid = validate(config);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors.map(err => ({
        path: err.instancePath,
        message: err.message,
        params: err.params
      }))
    };
  }

  // Validaciones adicionales de negocio
  const businessErrors = validateBusinessRules(config);

  if (businessErrors.length > 0) {
    return {
      valid: false,
      errors: businessErrors
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Validaciones de reglas de negocio no cubiertas por JSON Schema
 */
function validateBusinessRules(config) {
  const errors = [];

  // Validar que los puertos sean únicos
  const ports = [];
  if (config.stack?.backend?.port) {
    ports.push({ port: config.stack.backend.port, service: 'backend' });
  }
  if (config.stack?.frontend?.port) {
    ports.push({ port: config.stack.frontend.port, service: 'frontend' });
  }
  if (config.stack?.database?.port) {
    ports.push({ port: config.stack.database.port, service: 'database' });
  }

  const portMap = new Map();
  for (const { port, service } of ports) {
    if (portMap.has(port)) {
      errors.push({
        path: `/stack/${service}/port`,
        message: `Port ${port} is already used by ${portMap.get(port)}`,
        params: { port, conflictWith: portMap.get(port) }
      });
    } else {
      portMap.set(port, service);
    }
  }

  // Validar email format (adicional)
  if (config.team?.owner?.email && !isValidEmail(config.team.owner.email)) {
    errors.push({
      path: '/team/owner/email',
      message: 'Invalid email format',
      params: { email: config.team.owner.email }
    });
  }

  // Validar puertos (adicional)
  for (const { port, service } of ports) {
    if (!isValidPort(port)) {
      errors.push({
        path: `/stack/${service}/port`,
        message: 'Port must be between 1 and 65535',
        params: { port }
      });
    }
  }

  // Validar que el nombre de base de datos sea snake_case
  if (config.stack?.database?.name) {
    const dbName = config.stack.database.name;
    if (!/^[a-z0-9_]+$/.test(dbName)) {
      errors.push({
        path: '/stack/database/name',
        message: 'Database name must be in snake_case (lowercase letters, numbers, and underscores only)',
        params: { name: dbName }
      });
    }
  }

  // Validar que nameSnake y nameKebab sean correctos
  if (config.project?.nameSnake && !/^[a-z0-9_]+$/.test(config.project.nameSnake)) {
    errors.push({
      path: '/project/nameSnake',
      message: 'Project nameSnake must be in snake_case format',
      params: { name: config.project.nameSnake }
    });
  }

  if (config.project?.nameKebab && !/^[a-z0-9-]+$/.test(config.project.nameKebab)) {
    errors.push({
      path: '/project/nameKebab',
      message: 'Project nameKebab must be in kebab-case format',
      params: { name: config.project.nameKebab }
    });
  }

  // Validar que los dominios sean válidos (snake_case o kebab-case)
  if (config.domains?.examples) {
    config.domains.examples.forEach((domain, idx) => {
      if (!/^[a-z][a-z0-9_-]*$/.test(domain)) {
        errors.push({
          path: `/domains/examples/${idx}`,
          message: 'Domain name must be lowercase with optional hyphens or underscores',
          params: { domain }
        });
      }
    });
  }

  return errors;
}

/**
 * Valida que los directorios del proyecto existan
 */
async function validateProjectStructure(projectRoot, config) {
  const errors = [];

  // Verificar que el directorio del proyecto existe
  const projectExists = await fs.pathExists(projectRoot);
  if (!projectExists) {
    errors.push({
      path: 'projectRoot',
      message: `Project directory does not exist: ${projectRoot}`
    });
    return { valid: false, errors };
  }

  // Verificar directorios backend/frontend (opcional - pueden no existir aún)
  const backendDir = path.join(projectRoot, config.stack?.backend?.dirName || 'backend');
  const frontendDir = path.join(projectRoot, config.stack?.frontend?.dirName || 'frontend');

  const backendExists = await fs.pathExists(backendDir);
  const frontendExists = await fs.pathExists(frontendDir);

  // Solo advertir, no error
  const warnings = [];
  if (!backendExists) {
    warnings.push({
      path: 'backend',
      message: `Backend directory does not exist yet: ${backendDir}`,
      level: 'warning'
    });
  }

  if (!frontendExists) {
    warnings.push({
      path: 'frontend',
      message: `Frontend directory does not exist yet: ${frontendDir}`,
      level: 'warning'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida un proyecto existente antes de instalar el framework
 */
async function validateExistingProject(projectRoot, detection) {
  const errors = [];
  const warnings = [];

  // 1. Debe tener al menos backend O frontend
  if (!detection.backend.exists && !detection.frontend.exists) {
    errors.push({
      path: 'project',
      message: 'No backend or frontend directory found. This appears to be an empty project.',
      suggestion: 'Create backend/ and/or frontend/ directories first, or use "New Project" mode.'
    });
  }

  // 2. Si seleccionó "existing" pero está vacío, advertir
  if (!detection.isExistingProject) {
    warnings.push({
      path: 'project',
      message: 'No existing project structure detected.',
      suggestion: 'Consider using "New Project" mode instead for better scaffolding support.'
    });
  }

  // 3. Verificar si ya existe .claude/ (no debería, pero validar)
  if (detection.frameworkInstalled) {
    warnings.push({
      path: '.claude',
      message: `Framework already installed (version ${detection.frameworkVersion}).`,
      suggestion: 'Continuing will overwrite existing .claude/ directory.'
    });
  }

  // 4. Si no es un repositorio Git, advertir
  if (!detection.git.isGitRepo) {
    warnings.push({
      path: 'git',
      message: 'Not a git repository.',
      suggestion: 'GitHub workflow commands will not work. Run "git init" to initialize a repository.'
    });
  }

  // 5. Si tiene backend pero no tiene requirements.txt o package manager, advertir
  if (detection.backend.exists) {
    const requirementsTxt = require('path').join(projectRoot, detection.backend.dirName, 'requirements.txt');
    const pipfilePath = require('path').join(projectRoot, detection.backend.dirName, 'Pipfile');
    const poetryPath = require('path').join(projectRoot, detection.backend.dirName, 'pyproject.toml');

    const hasRequirements = await require('fs-extra').pathExists(requirementsTxt);
    const hasPipfile = await require('fs-extra').pathExists(pipfilePath);
    const hasPoetry = await require('fs-extra').pathExists(poetryPath);

    if (!hasRequirements && !hasPipfile && !hasPoetry) {
      warnings.push({
        path: 'backend/dependencies',
        message: 'No Python dependency file found (requirements.txt, Pipfile, or pyproject.toml).',
        suggestion: 'Some framework commands may need dependency management files.'
      });
    }
  }

  // 6. Si tiene frontend pero no tiene package.json, advertir
  if (detection.frontend.exists) {
    const packageJsonPath = require('path').join(projectRoot, detection.frontend.dirName, 'package.json');
    const hasPackageJson = await require('fs-extra').pathExists(packageJsonPath);

    if (!hasPackageJson) {
      warnings.push({
        path: 'frontend/dependencies',
        message: 'No package.json found in frontend directory.',
        suggestion: 'Some framework commands may need npm/yarn configuration.'
      });
    }
  }

  // 7. Si no tiene base de datos configurada, informar
  if (!detection.database.type) {
    warnings.push({
      path: 'database',
      message: 'Could not detect database configuration.',
      suggestion: 'You will need to configure database settings manually.'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Formatea errores de validación para mostrar al usuario
 */
function formatValidationErrors(errors) {
  if (!errors || errors.length === 0) {
    return 'No errors';
  }

  return errors.map(err => {
    const path = err.path || err.instancePath || 'unknown';
    const message = err.message || 'Unknown error';
    const params = err.params ? ` (${JSON.stringify(err.params)})` : '';
    return `  - ${path}: ${message}${params}`;
  }).join('\n');
}

/**
 * Formatea warnings de validación para mostrar al usuario
 */
function formatValidationWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    return '';
  }

  return warnings.map(warn => {
    const path = warn.path || 'unknown';
    const message = warn.message || 'Unknown warning';
    const suggestion = warn.suggestion ? `\n      → ${warn.suggestion}` : '';
    return `  ⚠  ${path}: ${message}${suggestion}`;
  }).join('\n\n');
}

module.exports = {
  validateConfig,
  validateBusinessRules,
  validateProjectStructure,
  validateExistingProject,
  formatValidationErrors,
  formatValidationWarnings
};
