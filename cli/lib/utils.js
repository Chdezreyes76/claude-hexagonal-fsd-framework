const path = require('path');

/**
 * Convierte un string a diferentes formatos de naming
 */
function generateNamingVariants(name) {
  const pascalCase = name
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  const snakeCase = name
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

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

function generateDbName(projectName, dbType = 'mysql') {
  const naming = generateNamingVariants(projectName);
  return `${naming.snake}_dev`;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

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
