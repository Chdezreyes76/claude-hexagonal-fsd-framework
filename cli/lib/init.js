const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { generateConfig, generateTemplateVariables } = require('./config-generator');
const { processTemplateDirectory } = require('./template-processor');
const { validateConfig, validateProjectStructure, formatValidationErrors } = require('./validator');
const { isValidEmail, isValidPort } = require('./utils');

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
    const stackAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'backendDir',
        message: 'Backend directory:',
        default: 'backend'
      },
      {
        type: 'input',
        name: 'backendPort',
        message: 'Backend port:',
        default: '8000',
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
        default: 'frontend'
      },
      {
        type: 'input',
        name: 'frontendPort',
        message: 'Frontend port:',
        default: '3000',
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
        choices: ['mysql', 'postgresql'],
        default: 'mysql'
      },
      {
        type: 'input',
        name: 'dbPort',
        message: 'Database port:',
        default: (answers) => (answers.dbType === 'mysql' ? '3306' : '5432'),
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

    // Paso 4: Dominios de negocio (opcional)
    console.log(chalk.yellow.bold('\n📦 Initial Business Domains (optional)\n'));
    console.log(chalk.gray('  You can add example domains that will be used in skills and documentation.\n'));

    const domains = [];
    let addingDomains = true;

    while (addingDomains) {
      const domainAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'domain',
          message: `Add domain ${domains.length > 0 ? `(${domains.join(', ')}) ` : ''}(Enter to skip):`,
          validate: (input) => {
            if (!input) return true; // Allow empty to skip
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

    // Paso 5: Customización de QA y workflows
    console.log(chalk.yellow.bold('\n🎨 Customization\n'));
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

    // Combinar todas las respuestas
    const allAnswers = {
      ...projectAnswers,
      ...teamAnswers,
      ...stackAnswers,
      ...customAnswers,
      domains
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

    // Mostrar mensaje de éxito
    showSuccessMessage(targetProjectPath, config);

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
 * Muestra mensaje de éxito final
 */
function showSuccessMessage(projectRoot, config) {
  console.log(chalk.green.bold('\n🎉 Setup complete!\n'));

  console.log(chalk.cyan('Project configured:'));
  console.log(chalk.white(`  Name: ${config.project.name}`));
  console.log(chalk.white(`  Location: ${projectRoot}`));
  console.log(chalk.white(`  Framework: ${config.frameworkVersion}\n`));

  console.log(chalk.cyan('Stack:'));
  console.log(chalk.white(`  Backend:  ${config.stack.backend.framework} (port ${config.stack.backend.port})`));
  console.log(chalk.white(`  Frontend: ${config.stack.frontend.framework} (port ${config.stack.frontend.port})`));
  console.log(chalk.white(`  Database: ${config.stack.database.type} (port ${config.stack.database.port})\n`));

  if (config.domains.examples.length > 0) {
    console.log(chalk.cyan('Business domains:'));
    console.log(chalk.white(`  ${config.domains.examples.join(', ')}\n`));
  }

  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.white('  1. Review .claude/claude.config.json'));
  console.log(chalk.white('  2. Explore available commands in .claude/commands/'));
  console.log(chalk.white('  3. Start using Claude Code with the framework skills\n'));

  console.log(chalk.gray('For more information, see the documentation at:'));
  console.log(chalk.gray('  https://github.com/yourorg/claude-hexagonal-fsd-framework\n'));
}

module.exports = {
  initWizard,
  setupClaudeDirectory,
  updateGitignore
};
