#!/usr/bin/env node

/**
 * Script de prueba para el detector de proyectos
 *
 * Uso:
 *   node test-detector.js <ruta-del-proyecto>
 *   node test-detector.js "C:/Users/username/my-project"
 */

const chalk = require('chalk');
const { detectProjectStructure, generateDetectionSummary } = require('./lib/project-detector');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(chalk.yellow('\nUsage: node test-detector.js <project-path>\n'));
    console.log('Example:');
    console.log('  node test-detector.js "../my-project"');
    console.log('  node test-detector.js "C:/Users/username/my-project"\n');
    process.exit(1);
  }

  const projectPath = path.resolve(args[0]);

  console.log(chalk.cyan.bold('\n┌─────────────────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│  Project Structure Detector - Test Tool            │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────────────────┘\n'));

  console.log(chalk.gray(`Analyzing: ${projectPath}\n`));

  try {
    // Detectar estructura
    const detection = await detectProjectStructure(projectPath);

    // Mostrar resumen legible
    console.log(generateDetectionSummary(detection));

    // Mostrar JSON completo
    console.log(chalk.cyan('\n─────────────────────────────────────────────────────'));
    console.log(chalk.cyan('Full Detection Result (JSON):'));
    console.log(chalk.cyan('─────────────────────────────────────────────────────\n'));
    console.log(JSON.stringify(detection, null, 2));

    // Conclusión
    console.log(chalk.cyan('\n─────────────────────────────────────────────────────\n'));

    if (detection.frameworkInstalled) {
      console.log(chalk.yellow('⚠️  Framework is already installed in this project.'));
      console.log(chalk.yellow(`    Version: ${detection.frameworkVersion}`));
      console.log(chalk.yellow('    Run "init" will skip or update the installation.\n'));
    } else if (detection.isExistingProject) {
      console.log(chalk.green('✓ This is an existing project.'));
      console.log(chalk.green('  Use "Existing Project" mode when running init wizard.\n'));
    } else {
      console.log(chalk.blue('ℹ This appears to be a new/empty project.'));
      console.log(chalk.blue('  Use "New Project" mode when running init wizard.\n'));
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Error detecting project structure:'));
    console.error(chalk.red(`   ${error.message}\n`));
    process.exit(1);
  }
}

main();
