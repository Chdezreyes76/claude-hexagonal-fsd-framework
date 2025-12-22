const fs = require('fs-extra');
const path = require('path');
const { generateNamingVariants, generateDbName } = require('./utils');

/**
 * Genera configuración completa desde respuestas del wizard
 */
async function generateConfig(answers, frameworkRoot) {
  // Cargar defaults
  const defaultsPath = path.join(frameworkRoot, 'config', 'defaults.json');
  const defaults = await fs.readJson(defaultsPath);

  // Leer versión del framework desde CLI package.json
  const cliPackagePath = path.join(frameworkRoot, 'cli', 'package.json');
  let frameworkVersion = defaults.version; // Fallback
  try {
    const cliPackage = await fs.readJson(cliPackagePath);
    frameworkVersion = cliPackage.version;
  } catch (error) {
    // Si no se puede leer, usar defaults como fallback
    console.warn('Warning: Could not read CLI package.json, using default version');
  }

  // Generar variantes de nombres
  const projectNaming = generateNamingVariants(answers.projectName);

  // Construir configuración completa
  const config = {
    version: defaults.version,
    frameworkVersion: frameworkVersion,
    lastUpdated: new Date().toISOString(),

    project: {
      name: answers.projectName,
      nameSnake: projectNaming.snake,
      nameKebab: projectNaming.kebab,
      description: answers.projectDescription || '',
      version: answers.projectVersion || defaults.project.version
    },

    team: {
      owner: {
        name: answers.userName || '',
        email: answers.userEmail
      },
      github: {
        owner: answers.githubOwner || '',
        repo: answers.githubRepo || projectNaming.kebab,
        mainBranch: answers.mainBranch || 'main'
      }
    },

    stack: {
      backend: {
        ...defaults.stack.backend,
        dirName: answers.backendDir || defaults.stack.backend.dirName,
        port: parseInt(answers.backendPort) || defaults.stack.backend.port
      },
      frontend: {
        ...defaults.stack.frontend,
        dirName: answers.frontendDir || defaults.stack.frontend.dirName,
        port: parseInt(answers.frontendPort) || defaults.stack.frontend.port
      },
      database: {
        ...defaults.stack.database,
        type: answers.dbType || defaults.stack.database.type,
        port: parseInt(answers.dbPort) || getDefaultDbPort(answers.dbType),
        name: answers.dbName || generateDbName(answers.projectName, answers.dbType)
      }
    },

    domains: {
      examples: answers.domains || [],
      namingConvention: defaults.domains.namingConvention
    },

    paths: {
      backend: {
        root: `./${answers.backendDir || defaults.stack.backend.dirName}`,
        domain: `./${answers.backendDir || defaults.stack.backend.dirName}/domain`,
        application: `./${answers.backendDir || defaults.stack.backend.dirName}/application`,
        adapter: `./${answers.backendDir || defaults.stack.backend.dirName}/adapter`
      },
      frontend: {
        root: `./${answers.frontendDir || defaults.stack.frontend.dirName}`,
        src: `./${answers.frontendDir || defaults.stack.frontend.dirName}/src`
      }
    },

    qa: {
      enabled: answers.qaEnabled !== undefined ? answers.qaEnabled : defaults.qa.enabled,
      emailReports: answers.qaEmailReports || defaults.qa.emailReports,
      localReportPath: defaults.qa.localReportPath
    },

    workflows: {
      autoImplement: answers.autoImplement !== undefined ? answers.autoImplement : defaults.workflows.autoImplement,
      autoReview: answers.autoReview !== undefined ? answers.autoReview : defaults.workflows.autoReview,
      autoMerge: answers.autoMerge !== undefined ? answers.autoMerge : defaults.workflows.autoMerge,
      requireTests: answers.requireTests !== undefined ? answers.requireTests : defaults.workflows.requireTests
    }
  };

  return config;
}

/**
 * Genera las variables de template desde la configuración
 */
function generateTemplateVariables(config) {
  return {
    // Project variables
    projectName: config.project.name,
    projectNameSnake: config.project.nameSnake,
    projectNameKebab: config.project.nameKebab,
    projectDescription: config.project.description,
    projectVersion: config.project.version,

    // Team variables
    userName: config.team.owner.name,
    userEmail: config.team.owner.email,
    githubOwner: config.team.github.owner,
    githubRepo: config.team.github.repo,
    mainBranch: config.team.github.mainBranch,

    // Stack variables
    backendLanguage: config.stack.backend.language,
    backendVersion: config.stack.backend.version,
    backendFramework: config.stack.backend.framework,
    backendDir: config.stack.backend.dirName,
    backendPort: config.stack.backend.port,

    frontendLanguage: config.stack.frontend.language,
    frontendFramework: config.stack.frontend.framework,
    frontendVersion: config.stack.frontend.version,
    frontendDir: config.stack.frontend.dirName,
    frontendPort: config.stack.frontend.port,

    dbType: config.stack.database.type,
    dbVersion: config.stack.database.version,
    dbName: config.stack.database.name,
    dbPort: config.stack.database.port,

    // Paths
    backendRoot: config.paths.backend.root,
    frontendRoot: config.paths.frontend.root,

    // Domain examples (para usar en skills)
    domainExamples: config.domains.examples.join(', ') || 'usuarios, productos, categorias',
    domainExamplesArray: config.domains.examples,

    // QA
    qaEnabled: config.qa.enabled,
    qaEmailReports: config.qa.emailReports,
    qaReportPath: config.qa.localReportPath,

    // Workflows
    autoImplement: config.workflows.autoImplement,
    autoReview: config.workflows.autoReview,
    autoMerge: config.workflows.autoMerge,
    requireTests: config.workflows.requireTests,

    // Metadata
    frameworkVersion: config.frameworkVersion,
    generatedDate: new Date().toISOString().split('T')[0]
  };
}

/**
 * Obtiene el puerto por defecto según el tipo de base de datos
 */
function getDefaultDbPort(dbType) {
  const ports = {
    mysql: 3306,
    postgresql: 5432
  };
  return ports[dbType] || 3306;
}

module.exports = {
  generateConfig,
  generateTemplateVariables,
  getDefaultDbPort
};
