const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { generateConfig, generateTemplateVariables } = require('./config-generator');
const { processTemplateDirectory } = require('./template-processor');
const { validateConfig, validateProjectStructure, formatValidationErrors, validateExistingProject, formatValidationWarnings } = require('./validator');
const { isValidEmail, isValidPort } = require('./utils');
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
        await executeInitialScaffolding(targetProjectPath, config, scaffoldAnswers, options);
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
 * Ejecuta scaffolding inicial para proyectos nuevos
 */
async function executeInitialScaffolding(projectRoot, config, scaffoldAnswers, options = {}) {
  console.log(chalk.yellow.bold('\n⚙️  Executing Initial Scaffolding...\n'));

  try {
    // TODO: Implementar scaffolders reales
    // Por ahora, solo mostrar qué se haría

    if (scaffoldAnswers.generateDocker) {
      const spinner = ora('Generating Docker development environment...').start();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular trabajo
      spinner.succeed('Docker environment configuration ready');
      console.log(chalk.gray('  Note: Docker scaffolder will be implemented soon'));
    }

    if (scaffoldAnswers.generateBackendCore) {
      const spinner = ora('Generating backend core infrastructure...').start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      spinner.succeed('Backend core configuration ready');
      console.log(chalk.gray('  Note: Backend core scaffolder will be implemented soon'));
    }

    if (scaffoldAnswers.scaffoldFirstDomain) {
      const spinner = ora(`Scaffolding domain: ${scaffoldAnswers.firstDomain}...`).start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      spinner.succeed(`Domain ${scaffoldAnswers.firstDomain} configuration ready`);
      console.log(chalk.gray('  Note: Domain scaffolder will be implemented soon'));
    }

    if (scaffoldAnswers.generateMainApp) {
      const spinner = ora('Generating main application...').start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      spinner.succeed('Main application configuration ready');
      console.log(chalk.gray('  Note: Main app scaffolder will be implemented soon'));
    }

    console.log(chalk.green('\n✓ Initial scaffolding planned!'));
    console.log(chalk.yellow('  Scaffolders are queued for implementation.'));
    console.log(chalk.yellow('  You can run scaffold commands manually for now:\n'));
    console.log(chalk.gray('    /scaffold:docker-dev'));
    console.log(chalk.gray('    /scaffold:backend-core'));
    console.log(chalk.gray('    /scaffold:new-domain <name>\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error during scaffolding:'));
    console.error(chalk.red(`   ${error.message}`));
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    console.log(chalk.yellow('\n⚠️  Scaffolding failed, but framework is installed.'));
    console.log(chalk.yellow('   You can run scaffold commands manually.\n'));
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
  if (isNewProject && Object.keys(scaffoldAnswers).length > 0) {
    const generated = [];
    if (scaffoldAnswers.generateDocker) generated.push('Docker environment');
    if (scaffoldAnswers.generateBackendCore) generated.push('Backend core');
    if (scaffoldAnswers.scaffoldFirstDomain) generated.push(`Domain: ${scaffoldAnswers.firstDomain}`);
    if (scaffoldAnswers.generateMainApp) generated.push('Main application');

    if (generated.length > 0) {
      console.log(chalk.cyan('Scaffolding planned:'));
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
