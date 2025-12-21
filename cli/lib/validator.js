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
    if (!/^[a-z_]+$/.test(dbName)) {
      errors.push({
        path: '/stack/database/name',
        message: 'Database name must be in snake_case (lowercase letters and underscores only)',
        params: { name: dbName }
      });
    }
  }

  // Validar que nameSnake y nameKebab sean correctos
  if (config.project?.nameSnake && !/^[a-z_]+$/.test(config.project.nameSnake)) {
    errors.push({
      path: '/project/nameSnake',
      message: 'Project nameSnake must be in snake_case format',
      params: { name: config.project.nameSnake }
    });
  }

  if (config.project?.nameKebab && !/^[a-z-]+$/.test(config.project.nameKebab)) {
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

module.exports = {
  validateConfig,
  validateBusinessRules,
  validateProjectStructure,
  formatValidationErrors
};
