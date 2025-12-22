const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { processTemplateDirectory } = require('./template-processor');
const { validateConfig } = require('./validator');
const { generateTemplateVariables } = require('./config-generator');

/**
 * Update an existing project with the latest framework version
 * @param {string} targetPath - Path to the project to update
 * @param {object} options - Update options
 */
async function updateFramework(targetPath, options = {}) {
  const verbose = options.verbose || false;
  const dryRun = options.dryRun || false;
  const skipBackup = options.skipBackup || false;

  console.log(chalk.blue.bold('\n🔄 Claude Hexagonal+FSD Framework - Update\n'));

  // Resolve paths
  const absoluteTargetPath = path.resolve(targetPath);
  const claudeDir = path.join(absoluteTargetPath, '.claude');
  const configPath = path.join(claudeDir, 'claude.config.json');
  const frameworkPath = path.resolve(__dirname, '..', '..');

  // Step 1: Validate project exists
  console.log(chalk.cyan('📋 Step 1/6: Validating project...'));

  if (!fs.existsSync(absoluteTargetPath)) {
    console.error(chalk.red(`❌ Project directory not found: ${absoluteTargetPath}`));
    process.exit(1);
  }

  if (!fs.existsSync(claudeDir)) {
    console.error(chalk.red(`❌ .claude directory not found. This doesn't appear to be a framework project.`));
    console.log(chalk.yellow(`\n💡 Hint: Use 'init' command for new projects:\n   node index.js init ${targetPath}\n`));
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red(`❌ claude.config.json not found in .claude directory.`));
    process.exit(1);
  }

  console.log(chalk.green(`✅ Project found: ${absoluteTargetPath}`));

  // Step 2: Read existing configuration
  console.log(chalk.cyan('\n📖 Step 2/6: Reading existing configuration...'));

  let config;
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
    console.log(chalk.green(`✅ Configuration loaded`));

    if (verbose) {
      console.log(chalk.gray(`   Project: ${config.project?.name || 'Unknown'}`));
      console.log(chalk.gray(`   Current version: ${config.frameworkVersion || 'Unknown'}`));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error reading configuration: ${error.message}`));
    process.exit(1);
  }

  // Get current and target framework versions
  const currentVersion = config.frameworkVersion || 'unknown';
  const packageJsonPath = path.join(frameworkPath, 'cli', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const targetVersion = packageJson.version;

  console.log(chalk.blue(`   Updating: ${currentVersion} → ${targetVersion}`));

  // Step 3: Create backup
  if (!skipBackup && !dryRun) {
    console.log(chalk.cyan('\n💾 Step 3/6: Creating backup...'));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const backupDir = path.join(claudeDir, `backup-${timestamp}`);

    const spinner = ora('Creating backup...').start();

    try {
      // Create backup directory
      await fs.ensureDir(backupDir);

      // Copy contents of .claude directory (excluding backup directories)
      const items = await fs.readdir(claudeDir);
      for (const item of items) {
        if (!item.startsWith('backup-')) {
          const srcPath = path.join(claudeDir, item);
          const destPath = path.join(backupDir, item);
          await fs.copy(srcPath, destPath);
        }
      }

      spinner.succeed(chalk.green(`✅ Backup created: ${path.basename(backupDir)}`));

      if (verbose) {
        console.log(chalk.gray(`   Location: ${backupDir}`));
      }
    } catch (error) {
      spinner.fail(chalk.red(`❌ Backup failed: ${error.message}`));
      process.exit(1);
    }
  } else {
    console.log(chalk.cyan('\n💾 Step 3/6: Skipping backup...'));
    if (dryRun) {
      console.log(chalk.yellow('   (Dry run mode)'));
    } else {
      console.log(chalk.yellow('   (--skip-backup flag)'));
    }
  }

  // Step 4: Copy updated framework files
  console.log(chalk.cyan('\n📦 Step 4/6: Copying framework files...'));

  if (dryRun) {
    console.log(chalk.yellow('   (Dry run - no files will be copied)'));
  }

  const spinner = ora('Copying files...').start();
  let filesCopied = 0;
  let filesUpdated = 0;

  try {
    // Directories to copy from framework
    const directoriesToCopy = [
      { src: 'core/agents', dest: 'agents' },
      { src: 'core/commands', dest: 'commands' },
      { src: 'core/skills', dest: 'skills' },
      { src: 'core/settings.json.tmpl', dest: 'settings.json.tmpl' }
    ];

    for (const dir of directoriesToCopy) {
      const srcPath = path.join(frameworkPath, dir.src);
      const destPath = path.join(claudeDir, dir.dest);

      if (!fs.existsSync(srcPath)) {
        if (verbose) {
          console.log(chalk.gray(`   Skipping ${dir.src} (not found)`));
        }
        continue;
      }

      if (!dryRun) {
        // Check if destination exists
        const isUpdate = fs.existsSync(destPath);

        await fs.copy(srcPath, destPath, {
          overwrite: true,
          filter: (src) => {
            // Don't copy user customizations
            return !src.includes('.custom.') &&
                   !src.includes('email-config.json') &&
                   !src.endsWith('README.md');
          }
        });

        if (isUpdate) {
          filesUpdated++;
        } else {
          filesCopied++;
        }
      }

      if (verbose) {
        const action = fs.existsSync(destPath) ? 'Updated' : 'Copied';
        console.log(chalk.gray(`   ${action}: ${dir.dest}`));
      }
    }

    spinner.succeed(chalk.green(`✅ Files copied (${filesCopied} new, ${filesUpdated} updated)`));
  } catch (error) {
    spinner.fail(chalk.red(`❌ Error copying files: ${error.message}`));
    process.exit(1);
  }

  // Step 5: Process templates with existing configuration
  console.log(chalk.cyan('\n🔧 Step 5/6: Processing templates...'));

  const templateSpinner = ora('Processing templates...').start();

  try {
    // Generate template variables from existing config
    const templateVars = generateTemplateVariables(config);

    if (verbose) {
      console.log(chalk.gray(`\n   Template variables generated: ${Object.keys(templateVars).length}`));
    }

    if (!dryRun) {
      // Process templates only in framework directories (agents, commands, skills)
      let totalProcessed = 0;
      const frameworkDirs = ['agents', 'commands', 'skills'];

      for (const dir of frameworkDirs) {
        const dirPath = path.join(claudeDir, dir);
        if (fs.existsSync(dirPath)) {
          const result = await processTemplateDirectory(dirPath, dirPath, templateVars);
          totalProcessed += result.processed?.length || 0;
        }
      }

      // Also process settings.json.tmpl if it exists
      const settingsTemplate = path.join(claudeDir, 'settings.json.tmpl');
      if (fs.existsSync(settingsTemplate)) {
        const processTemplateFile = require('./template-processor').processTemplateFile;
        const settingsOutput = path.join(claudeDir, 'settings.json');
        await processTemplateFile(settingsTemplate, settingsOutput, templateVars);
        totalProcessed++;
      }

      templateSpinner.succeed(chalk.green(`✅ Templates processed (${totalProcessed} files)`));
    } else {
      templateSpinner.succeed(chalk.yellow(`✅ Templates ready to process (dry run)`));
    }
  } catch (error) {
    templateSpinner.fail(chalk.red(`❌ Template processing failed: ${error.message}`));
    process.exit(1);
  }

  // Step 6: Update configuration metadata
  console.log(chalk.cyan('\n📝 Step 6/6: Updating configuration...'));

  if (!dryRun) {
    try {
      // Update framework version and timestamp
      config.frameworkVersion = targetVersion;
      config.lastUpdated = new Date().toISOString();

      // Write updated config
      fs.writeFileSync(
        configPath,
        JSON.stringify(config, null, 2),
        'utf8'
      );

      console.log(chalk.green(`✅ Configuration updated`));

      if (verbose) {
        console.log(chalk.gray(`   Framework version: ${targetVersion}`));
        console.log(chalk.gray(`   Last updated: ${config.lastUpdated}`));
      }

      // Validate updated configuration
      const schemaPath = path.join(frameworkPath, 'config', 'schema.json');
      const validation = await validateConfig(config, schemaPath);

      if (!validation.valid) {
        console.log(chalk.yellow(`\n⚠️  Configuration validation warnings:`));
        validation.errors.forEach(err => {
          const errPath = err.path || err.instancePath || '';
          const errMessage = err.message || 'Unknown error';
          console.log(chalk.yellow(`   - ${errPath}: ${errMessage}`));
        });
      } else {
        console.log(chalk.green(`✅ Configuration validated`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error updating configuration: ${error.message}`));
      process.exit(1);
    }
  } else {
    console.log(chalk.yellow(`✅ Configuration ready to update (dry run)`));
  }

  // Summary
  console.log(chalk.green.bold('\n✅ Update Complete!\n'));

  if (dryRun) {
    console.log(chalk.yellow('🔍 Dry run mode - no files were modified'));
    console.log(chalk.yellow('   Run without --dry-run to apply changes\n'));
  } else {
    console.log(chalk.cyan('📊 Summary:'));
    console.log(chalk.gray(`   Project: ${config.project?.name || 'Unknown'}`));
    console.log(chalk.gray(`   Version: ${currentVersion} → ${targetVersion}`));
    console.log(chalk.gray(`   Files: ${filesCopied} new, ${filesUpdated} updated`));

    if (!skipBackup) {
      console.log(chalk.gray(`   Backup: Created in .claude/backup-*`));
    }

    console.log(chalk.cyan('\n📖 Changelog:'));
    showChangelog(currentVersion, targetVersion);

    console.log(chalk.green('\n🎉 Your project has been updated successfully!\n'));
  }
}

/**
 * Show changelog between versions
 * @param {string} fromVersion - Current version
 * @param {string} toVersion - Target version
 */
function showChangelog(fromVersion, toVersion) {
  // In a real implementation, this would read from CHANGELOG.md
  // For now, we'll show a simple message

  console.log(chalk.gray(`   From: ${fromVersion}`));
  console.log(chalk.gray(`   To: ${toVersion}`));

  // Hardcoded changelog for current versions
  if (toVersion === '1.0.2') {
    console.log(chalk.gray('\n   New in v1.0.2:'));
    console.log(chalk.gray('   • Added /qa:review-done command (automated QA review)'));
    console.log(chalk.gray('   • Fixed email-config.json parametrization'));
    console.log(chalk.gray('   • Updated README with new command'));
  }

  console.log(chalk.gray(`\n   📄 Full changelog: CHANGELOG.md`));
}

module.exports = {
  updateFramework
};
