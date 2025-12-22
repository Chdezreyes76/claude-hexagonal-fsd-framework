const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { generateConfig, generateTemplateVariables } = require('./config-generator');
const { processTemplateDirectory, processTemplateFile } = require('./template-processor');
const { validateConfig, validateProjectStructure, formatValidationErrors, validateExistingProject, formatValidationWarnings } = require('./validator');
const { isValidEmail, isValidPort, generateNamingVariants } = require('./utils');
const Mustache = require('mustache');
const { detectProjectStructure, generateDetectionSummary } = require('./project-detector');

/**
 * Ejecuta el wizard de inicialización
 */
async function initWizard(targetProjectPath, options = {}) {
  console.log(chalk.cyan.bold('\n┌─────────────────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│  Claude Hexagonal+FSD Framework - Setup Wizard     │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────────────────┘\n'));

  const frameworkRoot = options.frameworkRoot || path.resolve(__dirname, '..', '..');

  try {
    // Verificar que el framework core existe
    const coreDir = path.join(frameworkRoot, 'core');
    if (!await fs.pathExists(coreDir)) {
      throw new Error(`Framework core not found at ${coreDir}`);
    }

    // Detectar estructura del proyecto
    console.log(chalk.gray('Analyzing project structure...\n'));
    const detection = await detectProjectStructure(targetProjectPath);

    // Verificar si ya está instalado
    if (detection.frameworkInstalled) {
      console.log(chalk.yellow('⚠️  Framework is already installed in this project!'));
      console.log(chalk.yellow(`   Version: ${detection.frameworkVersion}\n`));

      const confirmReinstall = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reinstall',
          message: 'Do you want to reinstall/update the framework?',
          default: false
        }
      ]);

      if (!confirmReinstall.reinstall) {
        console.log(chalk.gray('\nSetup cancelled.\n'));
        process.exit(0);
      }

      console.log(chalk.yellow('\n⚠️  Warning: This will overwrite existing .claude/ directory.'));
      console.log(chalk.yellow('   Make sure to backup any custom modifications.\n'));
    }

    // Paso 0: Determinar tipo de proyecto
    console.log(chalk.yellow.bold('\n🎯 Project Type\n'));

    let projectTypeChoice;

    // Si detectamos backend o frontend existente, sugerir "existing"
    if (detection.isExistingProject) {
      console.log(chalk.green('✓ Existing project structure detected:'));
      if (detection.backend.exists) {
        console.log(chalk.gray(`  - Backend: ${detection.backend.framework || 'detected'} (${detection.backend.dirName}/)`));
      }
      if (detection.frontend.exists) {
        console.log(chalk.gray(`  - Frontend: ${detection.frontend.framework || 'detected'} (${detection.frontend.dirName}/)`));
      }
      console.log('');

      projectTypeChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'projectType',
          message: 'How do you want to proceed?',
          choices: [
            {
              name: '📦 Add Claude tools to existing project (recommended)',
              value: 'existing',
              short: 'Existing'
            },
            {
              name: '🆕 Treat as new project and generate structure',
              value: 'new',
              short: 'New'
            }
          ],
          default: 'existing'
        }
      ]);
    } else {
      // Proyecto vacío/nuevo
      console.log(chalk.blue('ℹ No existing project structure detected.\n'));

      projectTypeChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'projectType',
          message: 'What type of project is this?',
          choices: [
            {
              name: '🆕 New Project - Generate full project structure',
              value: 'new',
              short: 'New'
            },
            {
              name: '📦 Existing Project - Add Claude tools only',
              value: 'existing',
              short: 'Existing'
            }
          ],
          default: 'new'
        }
      ]);
    }

    const isNewProject = projectTypeChoice.projectType === 'new';
    console.log(chalk.gray(`\nMode: ${isNewProject ? 'New Project' : 'Existing Project'}\n`));

    // Validar proyectos existentes
    if (!isNewProject) {
      console.log(chalk.yellow('Validating existing project structure...\n'));

      const validation = await validateExistingProject(targetProjectPath, detection);

      // Mostrar errores críticos
      if (!validation.valid) {
        console.log(chalk.red('❌ Validation failed:\n'));
        console.log(chalk.red(formatValidationErrors(validation.errors)));
        console.log('');

        const continueAnyway = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Continue anyway?',
            default: false
          }
        ]);

        if (!continueAnyway.continue) {
          console.log(chalk.gray('\nSetup cancelled.\n'));
          process.exit(0);
        }

        console.log(chalk.yellow('\n⚠️  Proceeding with invalid project structure.\n'));
      }

      // Mostrar warnings
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Warnings:\n'));
        console.log(chalk.yellow(formatValidationWarnings(validation.warnings)));
        console.log('');

        const acknowledgeWarnings = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'acknowledge',
            message: 'Continue with these warnings?',
            default: true
          }
        ]);

        if (!acknowledgeWarnings.acknowledge) {
          console.log(chalk.gray('\nSetup cancelled.\n'));
          process.exit(0);
        }

        console.log('');
      } else {
        console.log(chalk.green('✓ Project structure validated\n'));
      }
    }

    // Paso 1: Información del proyecto
    console.log(chalk.yellow.bold('\n📋 Project Information\n'));
    const projectAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Project name is required';
          }
          if (input.length > 100) {
            return 'Project name must be 100 characters or less';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Description (optional):',
        default: ''
      },
      {
        type: 'input',
        name: 'projectVersion',
        message: 'Initial version:',
        default: '1.0.0',
        validate: (input) => {
          if (!/^\d+\.\d+\.\d+$/.test(input)) {
            return 'Version must be in format X.Y.Z (e.g., 1.0.0)';
          }
          return true;
        }
      }
    ]);

    // Paso 2: Información del equipo
    console.log(chalk.yellow.bold('\n👤 Team Information\n'));
    const teamAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'userName',
        message: 'Your name (optional):',
        default: ''
      },
      {
        type: 'input',
        name: 'userEmail',
        message: 'Your email:',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Email is required';
          }
          if (!isValidEmail(input)) {
            return 'Invalid email format';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'githubOwner',
        message: 'GitHub username/org (optional):',
        default: ''
      },
      {
        type: 'input',
        name: 'githubRepo',
        message: 'GitHub repository name (optional):',
        default: ''
      },
      {
        type: 'input',
        name: 'mainBranch',
        message: 'Main branch name:',
        default: 'main'
      }
    ]);

    // Paso 3: Stack tecnológico
    console.log(chalk.yellow.bold('\n🛠️  Technology Stack\n'));

    // Para proyectos existentes, mostrar lo detectado y permitir confirmar
    if (!isNewProject && detection.isExistingProject) {
      console.log(chalk.green('Detected configuration:'));
      if (detection.backend.exists) {
        console.log(chalk.gray(`  Backend: ${detection.backend.dirName}/ (port ${detection.backend.port})`));
      }
      if (detection.frontend.exists) {
        console.log(chalk.gray(`  Frontend: ${detection.frontend.dirName}/ (port ${detection.frontend.port})`));
      }
      if (detection.database.type) {
        console.log(chalk.gray(`  Database: ${detection.database.type} (port ${detection.database.port})`));
      }
      console.log('');
    }

    const stackAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'backendDir',
        message: 'Backend directory:',
        default: detection.backend.dirName || 'backend',
        when: () => isNewProject || !detection.backend.exists
      },
      {
        type: 'input',
        name: 'backendPort',
        message: 'Backend port:',
        default: detection.backend.port?.toString() || '8000',
        validate: (input) => {
          if (!isValidPort(input)) {
            return 'Port must be between 1 and 65535';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'frontendDir',
        message: 'Frontend directory:',
        default: detection.frontend.dirName || 'frontend',
        when: () => isNewProject || !detection.frontend.exists
      },
      {
        type: 'input',
        name: 'frontendPort',
        message: 'Frontend port:',
        default: detection.frontend.port?.toString() || '3000',
        validate: (input) => {
          if (!isValidPort(input)) {
            return 'Port must be between 1 and 65535';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'dbType',
        message: 'Database type:',
        choices: ['mysql', 'postgresql', 'sqlserver', 'sqlite'],
        default: detection.database.type || 'mysql'
      },
      {
        type: 'input',
        name: 'dbPort',
        message: 'Database port:',
        default: (answers) => {
          if (detection.database.port) return detection.database.port.toString();
          return answers.dbType === 'mysql' ? '3306' :
                 answers.dbType === 'postgresql' ? '5432' :
                 answers.dbType === 'sqlserver' ? '1433' : '';
        },
        when: (answers) => answers.dbType !== 'sqlite',
        validate: (input) => {
          if (!isValidPort(input)) {
            return 'Port must be between 1 and 65535';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'dbName',
        message: 'Database name:',
        default: (answers) => {
          if (detection.database.name) return detection.database.name;
          const name = projectAnswers.projectName
            .toLowerCase()
            .replace(/[\s-]+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
          return `${name}_dev`;
        },
        validate: (input) => {
          if (!/^[a-z0-9_]+$/.test(input)) {
            return 'Database name must be lowercase with underscores only (snake_case), numbers allowed';
          }
          return true;
        }
      }
    ]);

    // Agregar valores detectados que no se preguntaron
    if (!isNewProject && detection.backend.exists && !stackAnswers.backendDir) {
      stackAnswers.backendDir = detection.backend.dirName;
    }
    if (!isNewProject && detection.frontend.exists && !stackAnswers.frontendDir) {
      stackAnswers.frontendDir = detection.frontend.dirName;
    }

    // Paso 4: Dominios de negocio (opcional)
    console.log(chalk.yellow.bold('\n📦 Business Domains\n'));

    // Mostrar dominios detectados en proyectos existentes
    const domains = [];
    if (!isNewProject && detection.domains.length > 0) {
      console.log(chalk.green('Detected existing domains:'));
      detection.domains.forEach(domain => {
        console.log(chalk.gray(`  - ${domain}`));
        domains.push(domain);
      });
      console.log('');

      const addMoreDomains = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Add more domains?',
          default: false
        }
      ]);

      if (!addMoreDomains.addMore) {
        console.log(chalk.gray('Using detected domains.\n'));
      } else {
        let addingDomains = true;
        while (addingDomains) {
          const domainAnswer = await inquirer.prompt([
            {
              type: 'input',
              name: 'domain',
              message: `Add domain (${domains.join(', ')}) (Enter to finish):`,
              validate: (input) => {
                if (!input) return true;
                if (!/^[a-z][a-z0-9_-]*$/.test(input)) {
                  return 'Domain name must be lowercase with optional hyphens or underscores';
                }
                if (domains.includes(input)) {
                  return 'Domain already added';
                }
                return true;
              }
            }
          ]);

          if (domainAnswer.domain && domainAnswer.domain.trim()) {
            domains.push(domainAnswer.domain.trim());
          } else {
            addingDomains = false;
          }
        }
      }
    } else {
      // Proyecto nuevo o sin dominios detectados
      console.log(chalk.gray('  Add example domains for skills and documentation.\n'));

      let addingDomains = true;
      while (addingDomains) {
        const domainAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'domain',
            message: `Add domain ${domains.length > 0 ? `(${domains.join(', ')}) ` : ''}(Enter to skip):`,
            validate: (input) => {
              if (!input) return true;
              if (!/^[a-z][a-z0-9_-]*$/.test(input)) {
                return 'Domain name must be lowercase with optional hyphens or underscores';
              }
              if (domains.includes(input)) {
                return 'Domain already added';
              }
              return true;
            }
          }
        ]);

        if (domainAnswer.domain && domainAnswer.domain.trim()) {
          domains.push(domainAnswer.domain.trim());
        } else {
          addingDomains = false;
        }
      }
    }

    // Paso 5: Customización de QA y workflows
    console.log(chalk.yellow.bold('\n🎨 Customization\n'));

    // Nota para proyectos existentes
    if (!isNewProject) {
      console.log(chalk.gray('  Note: Scaffolding is not available for existing projects.'));
      console.log(chalk.gray('  Only automation and workflow tools will be configured.\n'));
    }

    const customAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'qaEnabled',
        message: 'Enable QA automation:',
        default: true
      },
      {
        type: 'confirm',
        name: 'qaEmailReports',
        message: 'Enable email reports (local reports only by default):',
        default: false,
        when: (answers) => answers.qaEnabled
      },
      {
        type: 'confirm',
        name: 'autoImplement',
        message: 'Auto-implement issues:',
        default: true
      },
      {
        type: 'confirm',
        name: 'autoReview',
        message: 'Auto-review code:',
        default: true
      },
      {
        type: 'confirm',
        name: 'autoMerge',
        message: 'Auto-merge PRs:',
        default: false
      },
      {
        type: 'confirm',
        name: 'requireTests',
        message: 'Require passing tests before merge:',
        default: false
      }
    ]);

    // Paso 6: Initial Scaffolding (solo para proyectos nuevos)
    let scaffoldAnswers = {};

    if (isNewProject) {
      console.log(chalk.yellow.bold('\n🚀 Initial Scaffolding (optional)\n'));
      console.log(chalk.gray('  Generate initial project structure automatically.\n'));

      scaffoldAnswers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateDocker',
          message: 'Generate Docker development environment?',
          default: true
        },
        {
          type: 'confirm',
          name: 'generateBackendCore',
          message: 'Generate backend core (database, logging, settings)?',
          default: true
        },
        {
          type: 'confirm',
          name: 'scaffoldFirstDomain',
          message: 'Scaffold first domain with CRUD operations?',
          default: domains.length > 0,
          when: () => domains.length > 0
        },
        {
          type: 'list',
          name: 'firstDomain',
          message: 'Select domain to scaffold:',
          choices: domains,
          when: (answers) => answers.scaffoldFirstDomain && domains.length > 0
        },
        {
          type: 'confirm',
          name: 'generateMainApp',
          message: 'Generate main.py and basic frontend for first domain?',
          default: true,
          when: (answers) => answers.scaffoldFirstDomain
        }
      ]);

      // Mostrar resumen de lo que se generará
      if (Object.keys(scaffoldAnswers).length > 0 &&
          (scaffoldAnswers.generateDocker || scaffoldAnswers.generateBackendCore || scaffoldAnswers.scaffoldFirstDomain)) {
        console.log(chalk.cyan('\n📋 Will generate:'));
        if (scaffoldAnswers.generateDocker) {
          console.log(chalk.gray('  ✓ Docker development environment (compose, Dockerfiles, scripts)'));
        }
        if (scaffoldAnswers.generateBackendCore) {
          console.log(chalk.gray('  ✓ Backend core infrastructure (database, logging, settings)'));
        }
        if (scaffoldAnswers.scaffoldFirstDomain) {
          console.log(chalk.gray(`  ✓ Domain: ${scaffoldAnswers.firstDomain} (entities, use cases, repositories, router)`));
        }
        if (scaffoldAnswers.generateMainApp) {
          console.log(chalk.gray('  ✓ Main application (main.py, frontend pages, hooks)'));
        }
        console.log('');
      }
    }

    // Combinar todas las respuestas
    const allAnswers = {
      ...projectAnswers,
      ...teamAnswers,
      ...stackAnswers,
      ...customAnswers,
      ...scaffoldAnswers,
      domains,
      projectType: isNewProject ? 'new' : 'existing',
      detection: detection  // Pasar información de detección al generador
    };

    // Paso 6: Generar configuración
    const spinner = ora('Generating configuration...').start();

    const config = await generateConfig(allAnswers, frameworkRoot);

    // Validar configuración
    const schemaPath = path.join(frameworkRoot, 'config', 'schema.json');
    const validation = await validateConfig(config, schemaPath);

    if (!validation.valid) {
      spinner.fail('Configuration validation failed');
      console.log(chalk.red('\nValidation errors:'));
      console.log(chalk.red(formatValidationErrors(validation.errors)));
      process.exit(1);
    }

    spinner.succeed('Configuration generated and validated');

    // Paso 7: Setup del directorio .claude
    await setupClaudeDirectory(targetProjectPath, frameworkRoot, config, options);

    // Paso 8: Ejecutar scaffolding inicial (solo para proyectos nuevos)
    if (isNewProject && Object.keys(scaffoldAnswers).length > 0) {
      const hasScaffolding = scaffoldAnswers.generateDocker ||
                            scaffoldAnswers.generateBackendCore ||
                            scaffoldAnswers.scaffoldFirstDomain;

      if (hasScaffolding) {
        const scaffoldResults = await executeInitialScaffolding(targetProjectPath, config, scaffoldAnswers, options);
        scaffoldAnswers.results = scaffoldResults;
      }
    }

    // Mostrar mensaje de éxito
    showSuccessMessage(targetProjectPath, config, isNewProject, scaffoldAnswers);

  } catch (error) {
    console.error(chalk.red('\n❌ Error during setup:'));
    console.error(chalk.red(error.message));
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

/**
 * Configura el directorio .claude en el proyecto
 */
async function setupClaudeDirectory(projectRoot, frameworkRoot, config, options = {}) {
  const claudeDir = path.join(projectRoot, '.claude');

  console.log(chalk.yellow.bold('\n📂 Setting up .claude directory...\n'));

  // 1. Crear directorio .claude
  let spinner = ora('Creating .claude directory...').start();
  await fs.ensureDir(claudeDir);
  spinner.succeed('.claude directory created');

  // 2. Copiar framework core
  spinner = ora('Copying framework files...').start();
  const coreDir = path.join(frameworkRoot, 'core');

  // Generar variables de template
  const templateVars = generateTemplateVariables(config);

  // Procesar y copiar archivos con templates
  // Excluir commands y skills del procesamiento porque contienen ejemplos de sintaxis Mustache
  const results = await processTemplateDirectory(coreDir, claudeDir, templateVars, {
    processExtensions: ['.md', '.json', '.py', '.js', '.ts', '.tsx', '.yml', '.yaml', '.sh'],
    removeTmplExtension: true,
    excludeDirs: ['commands', 'skills']
  });

  spinner.succeed(`Framework files copied (${results.processed.length} processed, ${results.copied.length} copied)`);

  if (results.errors.length > 0) {
    console.log(chalk.yellow(`\n  ⚠️  ${results.errors.length} files had processing errors:`));
    results.errors.forEach(err => {
      console.log(chalk.yellow(`    - ${err.file}: ${err.error}`));
    });
  }

  // 2.5. Copiar templates a .claude/lib/templates
  spinner = ora('Copying code templates...').start();
  const templatesSourceDir = path.join(frameworkRoot, 'templates');
  const templatesTargetDir = path.join(claudeDir, 'lib', 'templates');

  // Verificar que existe el directorio de templates
  if (await fs.pathExists(templatesSourceDir)) {
    // Crear directorio lib si no existe
    await fs.ensureDir(path.join(claudeDir, 'lib'));

    // Copiar templates SIN procesar (los comandos los procesarán después)
    await fs.copy(templatesSourceDir, templatesTargetDir, {
      overwrite: true,
      errorOnExist: false
    });

    // Contar archivos copiados
    const countFiles = async (dir) => {
      let count = 0;
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          count += await countFiles(fullPath);
        } else {
          count++;
        }
      }
      return count;
    };

    const fileCount = await countFiles(templatesTargetDir);
    spinner.succeed(`Code templates copied (${fileCount} files)`);
  } else {
    spinner.warn('Templates directory not found, skipping...');
  }

  // 3. Generar claude.config.json
  spinner = ora('Generating claude.config.json...').start();
  const configPath = path.join(claudeDir, 'claude.config.json');
  await fs.writeJson(configPath, config, { spaces: 2 });
  spinner.succeed('claude.config.json generated');

  // 4. Crear directorio de reportes QA
  spinner = ora('Creating QA reports directory...').start();
  const qaReportsDir = path.join(claudeDir, 'qa-reports');
  await fs.ensureDir(qaReportsDir);

  // Crear .gitkeep para mantener el directorio
  await fs.writeFile(path.join(qaReportsDir, '.gitkeep'), '');
  spinner.succeed('QA reports directory created');

  // 5. Actualizar .gitignore
  spinner = ora('Updating .gitignore...').start();
  await updateGitignore(projectRoot);
  spinner.succeed('.gitignore updated');

  console.log(chalk.green('\n✓ .claude directory setup complete!'));
}

/**
 * Actualiza el .gitignore del proyecto
 */
async function updateGitignore(projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');

  const claudeEntries = [
    '',
    '# Claude Framework - Local reports',
    '.claude/qa-reports/',
    '',
    '# Claude Framework - Local settings (may contain secrets)',
    '.claude/settings.local.json'
  ].join('\n');

  let content = '';

  // Leer .gitignore existente si existe
  if (await fs.pathExists(gitignorePath)) {
    content = await fs.readFile(gitignorePath, 'utf-8');

    // Solo agregar si no existe ya
    if (!content.includes('.claude/qa-reports/')) {
      content += '\n' + claudeEntries;
    }
  } else {
    // Crear nuevo .gitignore
    content = claudeEntries;
  }

  await fs.writeFile(gitignorePath, content, 'utf-8');
}

/**
 * Scaffolder: Docker Development Environment
 */
async function dockerScaffolder(projectRoot, config, templatesRoot) {
  const templateVars = generateTemplateVariables(config);

  // Agregar condicionales para docker-compose según tipo de DB
  const dbType = config.stack.database.type;
  templateVars.if_mysql = dbType === 'mysql';
  templateVars.if_postgresql = dbType === 'postgresql';
  templateVars.if_sqlserver = dbType === 'sqlserver';
  templateVars.if_sqlite = dbType === 'sqlite';
  templateVars.if_not_sqlite = dbType !== 'sqlite';

  const dockerTemplatesDir = path.join(templatesRoot, 'docker');
  const backendDir = path.join(projectRoot, config.stack.backend.dirName);
  const frontendDir = path.join(projectRoot, config.stack.frontend.dirName);

  // Asegurar que existan los directorios backend y frontend
  await fs.ensureDir(backendDir);
  await fs.ensureDir(frontendDir);

  // 1. Crear Dockerfiles
  await processTemplateFile(
    path.join(dockerTemplatesDir, 'backend.Dockerfile.dev.tmpl'),
    path.join(backendDir, 'Dockerfile.dev'),
    templateVars
  );

  await processTemplateFile(
    path.join(dockerTemplatesDir, 'frontend.Dockerfile.dev.tmpl'),
    path.join(frontendDir, 'Dockerfile.dev'),
    templateVars
  );

  // 2. Crear .dockerignore files
  await processTemplateFile(
    path.join(dockerTemplatesDir, 'backend.dockerignore.tmpl'),
    path.join(backendDir, '.dockerignore'),
    templateVars
  );

  await processTemplateFile(
    path.join(dockerTemplatesDir, 'frontend.dockerignore.tmpl'),
    path.join(frontendDir, '.dockerignore'),
    templateVars
  );

  // 3. Generar docker-compose.dev.yml
  await processTemplateFile(
    path.join(dockerTemplatesDir, 'docker-compose.dev.yml.tmpl'),
    path.join(projectRoot, 'docker-compose.dev.yml'),
    templateVars
  );

  // 4. Crear scripts helper
  const scriptsDir = path.join(projectRoot, 'scripts');
  await fs.ensureDir(scriptsDir);

  await processTemplateFile(
    path.join(dockerTemplatesDir, 'scripts', 'docker-start.sh.tmpl'),
    path.join(scriptsDir, 'docker-start.sh'),
    templateVars
  );

  await processTemplateFile(
    path.join(dockerTemplatesDir, 'scripts', 'docker-start.bat.tmpl'),
    path.join(scriptsDir, 'docker-start.bat'),
    templateVars
  );

  await processTemplateFile(
    path.join(dockerTemplatesDir, 'scripts', 'docker-stop.sh.tmpl'),
    path.join(scriptsDir, 'docker-stop.sh'),
    templateVars
  );

  await processTemplateFile(
    path.join(dockerTemplatesDir, 'scripts', 'docker-stop.bat.tmpl'),
    path.join(scriptsDir, 'docker-stop.bat'),
    templateVars
  );

  // 5. Crear documentación
  await processTemplateFile(
    path.join(dockerTemplatesDir, 'DOCKER-README.md.tmpl'),
    path.join(projectRoot, 'DOCKER-README.md'),
    templateVars
  );

  // 6. Actualizar .gitignore con entradas de Docker
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const dockerGitignoreTemplate = await fs.readFile(
    path.join(dockerTemplatesDir, 'gitignore-docker.tmpl'),
    'utf-8'
  );
  const dockerGitignoreContent = Mustache.render(dockerGitignoreTemplate, templateVars);

  let gitignoreContent = '';
  if (await fs.pathExists(gitignorePath)) {
    gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');

    // Solo agregar si no existe ya sección Docker
    if (!gitignoreContent.includes('# Docker')) {
      gitignoreContent += '\n' + dockerGitignoreContent;
      await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
    }
  } else {
    await fs.writeFile(gitignorePath, dockerGitignoreContent, 'utf-8');
  }
}

/**
 * Scaffolder: Backend Core Infrastructure
 */
async function backendCoreScaffolder(projectRoot, config, templatesRoot) {
  const templateVars = generateTemplateVariables(config);

  // Agregar condicionales para conexión de DB según tipo
  const dbType = config.stack.database.type;
  templateVars.if_mysql = dbType === 'mysql';
  templateVars.if_postgresql = dbType === 'postgresql';
  templateVars.if_sqlserver = dbType === 'sqlserver';
  templateVars.if_sqlite = dbType === 'sqlite';

  const backendCoreTemplatesDir = path.join(templatesRoot, 'backend', 'core');
  const backendDir = path.join(projectRoot, config.stack.backend.dirName);
  const coreDir = path.join(backendDir, 'core');

  // Asegurar que exista el directorio backend
  await fs.ensureDir(backendDir);

  // 1. Crear estructura de directorios
  await fs.ensureDir(path.join(coreDir, 'database'));
  await fs.ensureDir(path.join(coreDir, 'logging'));

  // 2. Generar archivos core
  await processTemplateFile(
    path.join(backendCoreTemplatesDir, '__init__.py.tmpl'),
    path.join(coreDir, '__init__.py'),
    templateVars
  );

  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'settings.py.tmpl'),
    path.join(coreDir, 'settings.py'),
    templateVars
  );

  // 3. Generar archivos database
  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'database', '__init__.py.tmpl'),
    path.join(coreDir, 'database', '__init__.py'),
    templateVars
  );

  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'database', 'connection.py.tmpl'),
    path.join(coreDir, 'database', 'connection.py'),
    templateVars
  );

  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'database', 'session.py.tmpl'),
    path.join(coreDir, 'database', 'session.py'),
    templateVars
  );

  // 4. Generar archivos logging
  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'logging', '__init__.py.tmpl'),
    path.join(coreDir, 'logging', '__init__.py'),
    templateVars
  );

  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'logging', 'context.py.tmpl'),
    path.join(coreDir, 'logging', 'context.py'),
    templateVars
  );

  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'logging', 'formatters.py.tmpl'),
    path.join(coreDir, 'logging', 'formatters.py'),
    templateVars
  );

  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'logging', 'logger.py.tmpl'),
    path.join(coreDir, 'logging', 'logger.py'),
    templateVars
  );

  // 5. Generar .env.example
  await processTemplateFile(
    path.join(backendCoreTemplatesDir, 'env.example.tmpl'),
    path.join(backendDir, '.env.example'),
    templateVars
  );

  // 6. Actualizar requirements.txt
  const requirementsPath = path.join(backendDir, 'requirements.txt');
  const requirementsCoreTemplate = await fs.readFile(
    path.join(backendCoreTemplatesDir, 'requirements-core.txt.tmpl'),
    'utf-8'
  );
  const requirementsCoreContent = Mustache.render(requirementsCoreTemplate, templateVars);

  let requirementsContent = '';
  if (await fs.pathExists(requirementsPath)) {
    requirementsContent = await fs.readFile(requirementsPath, 'utf-8');

    // Agregar solo si no existen ya (evitar duplicados)
    const newRequirements = requirementsCoreContent.split('\n').filter(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return true;
      return !requirementsContent.includes(trimmed.split('>=')[0]);
    });

    if (newRequirements.length > 0) {
      requirementsContent += '\n' + newRequirements.join('\n');
      await fs.writeFile(requirementsPath, requirementsContent, 'utf-8');
    }
  } else {
    await fs.writeFile(requirementsPath, requirementsCoreContent, 'utf-8');
  }
}

/**
 * Scaffolder: Business Domain
 */
async function domainScaffolder(projectRoot, config, domainName, templatesRoot) {
  const templateVars = generateTemplateVariables(config);

  // Generar variantes del nombre del dominio
  const domainNaming = generateNamingVariants(domainName);
  templateVars.domain = domainNaming.snake;
  templateVars.Domain = domainNaming.pascal;
  templateVars.domains = domainNaming.snake + 's'; // plural para rutas
  templateVars.DOMAIN = domainNaming.snake.toUpperCase();

  const backendTemplatesDir = path.join(templatesRoot, 'backend');
  const frontendTemplatesDir = path.join(templatesRoot, 'frontend');
  const backendDir = path.join(projectRoot, config.stack.backend.dirName);
  const frontendDir = path.join(projectRoot, config.stack.frontend.dirName);

  // Asegurar que existan los directorios backend y frontend
  await fs.ensureDir(backendDir);
  await fs.ensureDir(path.join(frontendDir, 'src'));

  // === BACKEND ===

  // 1. Entity
  const entitiesDir = path.join(backendDir, 'domain', 'entities');
  await fs.ensureDir(entitiesDir);
  await processTemplateFile(
    path.join(backendTemplatesDir, 'entity.py.tmpl'),
    path.join(entitiesDir, `${domainNaming.snake}.py`),
    templateVars
  );

  // 2. DTOs
  const dtosDir = path.join(backendDir, 'application', 'dtos', domainNaming.snake);
  await fs.ensureDir(dtosDir);
  await fs.writeFile(path.join(dtosDir, '__init__.py'), '');

  await processTemplateFile(
    path.join(backendTemplatesDir, 'request_dto.py.tmpl'),
    path.join(dtosDir, `${domainNaming.snake}_request_dto.py`),
    templateVars
  );

  await processTemplateFile(
    path.join(backendTemplatesDir, 'response_dto.py.tmpl'),
    path.join(dtosDir, `${domainNaming.snake}_response_dto.py`),
    templateVars
  );

  // 3. Port
  const portsDir = path.join(backendDir, 'application', 'ports', domainNaming.snake);
  await fs.ensureDir(portsDir);
  await fs.writeFile(path.join(portsDir, '__init__.py'), '');

  await processTemplateFile(
    path.join(backendTemplatesDir, 'port.py.tmpl'),
    path.join(portsDir, `${domainNaming.snake}_port.py`),
    templateVars
  );

  // 4. Use Cases
  const useCasesDir = path.join(backendDir, 'application', 'use_cases', domainNaming.snake);
  await fs.ensureDir(useCasesDir);
  await fs.writeFile(path.join(useCasesDir, '__init__.py'), '');

  await processTemplateFile(
    path.join(backendTemplatesDir, 'use_case_crear.py.tmpl'),
    path.join(useCasesDir, `crear_${domainNaming.snake}_use_case.py`),
    templateVars
  );

  await processTemplateFile(
    path.join(backendTemplatesDir, 'use_case_listar.py.tmpl'),
    path.join(useCasesDir, `listar_${domainNaming.snake}_use_case.py`),
    templateVars
  );

  // 5. Router
  const routersDir = path.join(backendDir, 'adapter', 'inbound', 'api', 'routers');
  await fs.ensureDir(routersDir);

  await processTemplateFile(
    path.join(backendTemplatesDir, 'router.py.tmpl'),
    path.join(routersDir, `${domainNaming.snake}_router.py`),
    templateVars
  );

  // 6. Dependency
  const dependenciesDir = path.join(backendDir, 'adapter', 'inbound', 'api', 'dependencies', domainNaming.snake);
  await fs.ensureDir(dependenciesDir);
  await fs.writeFile(path.join(dependenciesDir, '__init__.py'), '');

  await processTemplateFile(
    path.join(backendTemplatesDir, 'dependency.py.tmpl'),
    path.join(dependenciesDir, `${domainNaming.snake}_dependency.py`),
    templateVars
  );

  // 7. Model
  const modelsDir = path.join(backendDir, 'adapter', 'outbound', 'database', 'models');
  await fs.ensureDir(modelsDir);

  await processTemplateFile(
    path.join(backendTemplatesDir, 'model.py.tmpl'),
    path.join(modelsDir, `${domainNaming.snake}_model.py`),
    templateVars
  );

  // 8. Repository
  const repositoriesDir = path.join(backendDir, 'adapter', 'outbound', 'database', 'repositories');
  await fs.ensureDir(repositoriesDir);

  await processTemplateFile(
    path.join(backendTemplatesDir, 'repository.py.tmpl'),
    path.join(repositoriesDir, `${domainNaming.snake}_repository.py`),
    templateVars
  );

  // === FRONTEND ===

  // 1. Entity types
  const entityDir = path.join(frontendDir, 'src', 'entities', domainNaming.snake, 'model');
  await fs.ensureDir(entityDir);

  await processTemplateFile(
    path.join(frontendTemplatesDir, 'types.ts.tmpl'),
    path.join(entityDir, 'types.ts'),
    templateVars
  );

  // 2. Service
  const servicesDir = path.join(frontendDir, 'src', 'services');
  await fs.ensureDir(servicesDir);

  await processTemplateFile(
    path.join(frontendTemplatesDir, 'service.ts.tmpl'),
    path.join(servicesDir, `${domainNaming.snake}.service.ts`),
    templateVars
  );

  // 3. Hook
  const hooksDir = path.join(frontendDir, 'src', 'hooks');
  await fs.ensureDir(hooksDir);

  await processTemplateFile(
    path.join(frontendTemplatesDir, 'hook.ts.tmpl'),
    path.join(hooksDir, `use${domainNaming.pascal}.ts`),
    templateVars
  );

  // 4. Page
  const pagesDir = path.join(frontendDir, 'src', 'pages', domainNaming.pascal);
  await fs.ensureDir(pagesDir);

  await processTemplateFile(
    path.join(frontendTemplatesDir, 'page.tsx.tmpl'),
    path.join(pagesDir, `${domainNaming.pascal}Page.tsx`),
    templateVars
  );
}

/**
 * Scaffolder: Main Application
 */
async function mainAppScaffolder(projectRoot, config) {
  const templateVars = generateTemplateVariables(config);
  const backendDir = path.join(projectRoot, config.stack.backend.dirName);

  // Asegurar que exista el directorio backend
  await fs.ensureDir(backendDir);

  // Crear main.py básico si no existe
  const mainPath = path.join(backendDir, 'main.py');

  if (await fs.pathExists(mainPath)) {
    return; // No sobrescribir si ya existe
  }

  const mainContent = `"""
${config.project.name} - Main Application
${config.project.description || ''}

FastAPI application with hexagonal architecture.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.logging import setup_logging, disable_external_loggers
from core import settings

# Inicializar logging
setup_logging(level=settings.LOG_LEVEL, format_type=settings.LOG_FORMAT)
disable_external_loggers()

# Crear aplicación
app = FastAPI(
    title="${config.project.name}",
    description="${config.project.description || ''}",
    version="${config.project.version}",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:${config.stack.frontend.port}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
# TODO: Importar y registrar routers de dominios
# from adapter.inbound.api.routers import example_router
# app.include_router(example_router.router, prefix="/api/v1", tags=["example"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "name": "${config.project.name}",
        "version": "${config.project.version}",
        "status": "running"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=${config.stack.backend.port},
        reload=True,
        log_config=None  # Use our custom logging
    )
`;

  await fs.writeFile(mainPath, mainContent, 'utf-8');
}

/**
 * Ejecuta scaffolding inicial para proyectos nuevos
 */
async function executeInitialScaffolding(projectRoot, config, scaffoldAnswers, options = {}) {
  console.log(chalk.yellow.bold('\n⚙️  Executing Initial Scaffolding...\n'));

  const frameworkRoot = options.frameworkRoot || path.resolve(__dirname, '..', '..');
  const templatesRoot = path.join(frameworkRoot, 'templates');

  const results = {
    docker: false,
    backendCore: false,
    domain: false,
    mainApp: false
  };

  try {
    // 1. Generar Docker environment
    if (scaffoldAnswers.generateDocker) {
      const spinner = ora('Generating Docker development environment...').start();
      try {
        await dockerScaffolder(projectRoot, config, templatesRoot);
        spinner.succeed('Docker environment created');
        results.docker = true;
      } catch (error) {
        spinner.fail('Docker generation failed');
        throw error;
      }
    }

    // 2. Generar Backend Core
    if (scaffoldAnswers.generateBackendCore) {
      const spinner = ora('Generating backend core infrastructure...').start();
      try {
        await backendCoreScaffolder(projectRoot, config, templatesRoot);
        spinner.succeed('Backend core infrastructure created');
        results.backendCore = true;
      } catch (error) {
        spinner.fail('Backend core generation failed');
        throw error;
      }
    }

    // 3. Scaffold First Domain
    if (scaffoldAnswers.scaffoldFirstDomain && scaffoldAnswers.firstDomain) {
      const spinner = ora(`Scaffolding domain: ${scaffoldAnswers.firstDomain}...`).start();
      try {
        await domainScaffolder(projectRoot, config, scaffoldAnswers.firstDomain, templatesRoot);
        spinner.succeed(`Domain "${scaffoldAnswers.firstDomain}" scaffolded`);
        results.domain = scaffoldAnswers.firstDomain;
      } catch (error) {
        spinner.fail(`Domain scaffolding failed`);
        throw error;
      }
    }

    // 4. Generate Main App
    if (scaffoldAnswers.generateMainApp) {
      const spinner = ora('Generating main application...').start();
      try {
        await mainAppScaffolder(projectRoot, config);
        spinner.succeed('Main application (main.py) created');
        results.mainApp = true;
      } catch (error) {
        spinner.fail('Main app generation failed');
        throw error;
      }
    }

    console.log(chalk.green('\n✓ Initial scaffolding completed!\n'));

    return results;

  } catch (error) {
    console.error(chalk.red('\n❌ Error during scaffolding:'));
    console.error(chalk.red(`   ${error.message}`));
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    console.log(chalk.yellow('\n⚠️  Scaffolding failed, but framework is installed.'));
    console.log(chalk.yellow('   You can run scaffold commands manually:\n'));
    console.log(chalk.gray('    /scaffold:docker-dev'));
    console.log(chalk.gray('    /scaffold:backend-core'));
    console.log(chalk.gray('    /scaffold:new-domain <name>\n'));

    return results;
  }
}

/**
 * Muestra mensaje de éxito final
 */
function showSuccessMessage(projectRoot, config, isNewProject = true, scaffoldAnswers = {}) {
  console.log(chalk.green.bold('\n🎉 Setup complete!\n'));

  console.log(chalk.cyan('Project configured:'));
  console.log(chalk.white(`  Name: ${config.project.name}`));
  console.log(chalk.white(`  Type: ${config.projectType === 'new' ? 'New Project' : 'Existing Project'}`));
  console.log(chalk.white(`  Location: ${projectRoot}`));
  console.log(chalk.white(`  Framework: ${config.frameworkVersion}\n`));

  console.log(chalk.cyan('Stack:'));
  console.log(chalk.white(`  Backend:  ${config.stack.backend.framework} (port ${config.stack.backend.port})`));
  console.log(chalk.white(`  Frontend: ${config.stack.frontend.framework} (port ${config.stack.frontend.port})`));
  console.log(chalk.white(`  Database: ${config.stack.database.type} (port ${config.stack.database.port || 'N/A'})\n`));

  if (config.domains.examples.length > 0) {
    console.log(chalk.cyan('Business domains:'));
    console.log(chalk.white(`  ${config.domains.examples.join(', ')}\n`));
  }

  // Mostrar qué se generó (para proyectos nuevos)
  if (isNewProject && scaffoldAnswers.results) {
    const results = scaffoldAnswers.results;
    const generated = [];
    if (results.docker) generated.push('Docker environment');
    if (results.backendCore) generated.push('Backend core infrastructure');
    if (results.domain) generated.push(`Domain: ${results.domain}`);
    if (results.mainApp) generated.push('Main application (main.py)');

    if (generated.length > 0) {
      console.log(chalk.cyan('Scaffolding completed:'));
      generated.forEach(item => console.log(chalk.white(`  ✓ ${item}`)));
      console.log('');
    }
  }

  // Next steps diferenciados
  console.log(chalk.cyan('Next steps:'));

  if (config.projectType === 'existing') {
    console.log(chalk.white('  1. Review .claude/claude.config.json'));
    console.log(chalk.white('  2. Try: /github:priorities'));
    console.log(chalk.white('  3. Try: /scaffold:new-domain <name>'));
    console.log(chalk.white('  4. Explore available commands in .claude/commands/\n'));
  } else {
    if (scaffoldAnswers.generateDocker) {
      console.log(chalk.white('  1. Start Docker: ./scripts/docker-start.sh (or .bat on Windows)'));
      console.log(chalk.white('  2. Apply migrations: docker exec backend alembic upgrade head'));
    } else {
      console.log(chalk.white('  1. Set up your backend and frontend directories'));
      console.log(chalk.white('  2. Run /scaffold:docker-dev if you need Docker'));
    }
    console.log(chalk.white('  3. Review .claude/claude.config.json'));
    console.log(chalk.white('  4. Start using Claude Code with the framework skills\n'));
  }

  console.log(chalk.gray('Framework documentation:'));
  console.log(chalk.gray('  https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework\n'));
}

module.exports = {
  initWizard,
  setupClaudeDirectory,
  updateGitignore,
  executeInitialScaffolding
};
