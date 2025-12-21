#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const { initWizard } = require('./lib/init');

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Determinar el framework root (donde está el CLI)
  const frameworkRoot = path.resolve(__dirname, '..');

  switch (command) {
    case 'init': {
      // Obtener el path del proyecto destino
      let targetPath = args[1] || process.cwd();

      // Resolver path absoluto
      targetPath = path.resolve(targetPath);

      // Opciones
      const options = {
        frameworkRoot,
        verbose: args.includes('--verbose') || args.includes('-v')
      };

      // Ejecutar wizard
      await initWizard(targetPath, options);
      break;
    }

    case 'update': {
      console.log(chalk.yellow('\nUpdate command coming soon...\n'));
      console.log(chalk.gray('This will update an existing .claude directory with the latest framework version.'));
      console.log(chalk.gray('Your claude.config.json will be preserved.\n'));
      process.exit(0);
      break;
    }

    case 'validate': {
      console.log(chalk.yellow('\nValidate command coming soon...\n'));
      console.log(chalk.gray('This will validate your claude.config.json against the schema.\n'));
      process.exit(0);
      break;
    }

    case 'version':
    case '--version':
    case '-v': {
      const packageJson = require('./package.json');
      console.log(chalk.cyan(`\nClaude Hexagonal+FSD Framework CLI v${packageJson.version}\n`));
      process.exit(0);
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    default: {
      showHelp();
      process.exit(command === 'help' || command === '--help' || command === '-h' ? 0 : 1);
    }
  }
}

/**
 * Muestra la ayuda del CLI
 */
function showHelp() {
  console.log(chalk.cyan.bold('\n┌─────────────────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│  Claude Hexagonal+FSD Framework CLI                 │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────────────────┘\n'));

  console.log(chalk.yellow('Usage:'));
  console.log(chalk.white('  node index.js <command> [options]\n'));

  console.log(chalk.yellow('Commands:'));
  console.log(chalk.white('  init [path]        Initialize framework in a project'));
  console.log(chalk.white('                     Default path: current directory'));
  console.log(chalk.white('                     Example: node index.js init ../my-project\n'));

  console.log(chalk.white('  update [path]      Update existing framework installation'));
  console.log(chalk.white('                     (Coming soon)\n'));

  console.log(chalk.white('  validate [path]    Validate claude.config.json'));
  console.log(chalk.white('                     (Coming soon)\n'));

  console.log(chalk.white('  version            Show CLI version'));
  console.log(chalk.white('  help               Show this help message\n'));

  console.log(chalk.yellow('Options:'));
  console.log(chalk.white('  --verbose, -v      Show detailed output\n'));

  console.log(chalk.yellow('Examples:'));
  console.log(chalk.gray('  # Initialize in current directory'));
  console.log(chalk.white('  node index.js init\n'));

  console.log(chalk.gray('  # Initialize in specific project'));
  console.log(chalk.white('  node index.js init /path/to/my-project\n'));

  console.log(chalk.gray('  # Initialize with verbose output'));
  console.log(chalk.white('  node index.js init --verbose\n'));

  console.log(chalk.yellow('Framework Features:'));
  console.log(chalk.white('  • 11 specialized skills (hexagonal, FSD, implementers, QA, etc.)'));
  console.log(chalk.white('  • 20+ commands (GitHub, scaffold, quality, workflows)'));
  console.log(chalk.white('  • 3 AI agents (planner, reviewer, debugger)'));
  console.log(chalk.white('  • 18+ code templates'));
  console.log(chalk.white('  • Interactive setup wizard'));
  console.log(chalk.white('  • Automated issue workflows\n'));

  console.log(chalk.gray('For more information:'));
  console.log(chalk.gray('  https://github.com/yourorg/claude-hexagonal-fsd-framework\n'));
}

// Ejecutar CLI
main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'));
  console.error(chalk.red(error.message));
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    console.error(chalk.gray(error.stack));
  }
  process.exit(1);
});
