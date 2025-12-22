# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-12-22

### Added
- **CLI Update Command**: Fully functional `update` command for updating existing framework installations
  - `node index.js update [path]` - Update framework in existing project
  - Automatic backup creation (with `--skip-backup` option)
  - Dry run mode (`--dry-run`) to preview changes
  - Preserves existing `claude.config.json` configuration
  - Shows changelog between versions
  - Validates configuration after update
  - New module: `cli/lib/update.js` (220 lines)

- **QA Review Command**: New `/qa:review-done` command for automated QA review
  - Execute skill directly: `/qa:review-done <project-number>`
  - Verifies all issues in "Done" column
  - Runs TypeScript compilation checks
  - Opens browser and checks for console errors
  - Takes screenshots as evidence
  - Moves approved issues to "Reviewed"
  - Generates detailed QA report
  - Sends email summary to user
  - New file: `core/commands/qa/review-done.md` (complete documentation)

### Fixed
- **Email Configuration**: Parametrized hardcoded email address in `qa-review-done` skill
  - Changed `qa-bot@gextiona.com` to `qa-bot@{{projectNameKebab}}.com`
  - Ensures proper parametrization across all configurations
- **CLI Help URL**: Corrected repository URL in help text from `yourorg` to `Chdezreyes76`

### Changed
- **CLI Help**: Updated help text with update command examples and options
  - Added `--dry-run` and `--skip-backup` options documentation
  - Added update command usage examples
  - Improved command descriptions

### Developer Experience
- Projects can now be easily updated to latest framework version
- No manual file copying or configuration editing required
- Safe updates with automatic backups
- Preview changes before applying

## [1.0.1] - 2025-12-22

### Fixed
- **Repository URLs**: Corrected all references from `yourorg` to `Chdezreyes76` across documentation
  - README.md git clone instructions
  - CLI examples and quick reference
  - Getting started documentation
  - All GitHub repository links now point to correct URL

### Removed
- **Internal Development Files**: Cleaned up files not intended for public distribution
  - Development scripts (SETUP.ps1, PARAMETRIZE.ps1, generate-cli.ps1)
  - Internal documentation (FRAMEWORK_COMPLETE.md, FRAMEWORK_STATUS.md, INSTRUCCIONES.md)
  - Internal CLI docs (FILES_CREATED.txt, DELIVERY_SUMMARY.md, IMPLEMENTATION_SUMMARY.md, MANIFEST.md)
  - Project-specific examples (EXAMPLE_PRIORITIES.md, EXAMPLE_SESSION.md)
  - Unparametrized agent file (code-reviewer.md - .tmpl version exists)
  - Updated .gitignore to prevent future inclusion

### Changed
- **Documentation Improvements**:
  - Added professional badges to README (license, version, technologies, status)
  - Updated skill titles from "Gextiona" to generic "Patterns"
  - Replaced Gextiona-specific examples with generic MyApp examples
  - Added 20 GitHub topics for better discoverability

### Notes
- This is a cleanup release with no functional changes to the framework
- All core features from v1.0.0 remain unchanged
- Repository now contains only user-facing documentation and code

## [1.0.0] - 2025-12-21

### Added

#### Core Framework
- **11 Skills** for Claude Code automation:
  - `hexagonal-architecture` - Backend FastAPI patterns with ports & adapters
  - `feature-sliced-design` - Frontend React patterns with FSD layers
  - `backend-implementer` - Automated backend issue implementation
  - `frontend-implementer` - Automated frontend issue implementation
  - `fullstack-implementer` - End-to-end fullstack orchestration
  - `issue-analyzer` - Semantic issue analysis and routing
  - `test-runner` - Automated test execution before commits
  - `qa-review-done` - Automated QA review workflow
  - `github-workflow` - Git conventions (branches, commits, PRs)
  - `alembic-migrations` - Database migration patterns
  - `issue-workflow` - Complete issue lifecycle automation

- **20+ Commands** organized in 5 categories:
  - `github:*` - GitHub integration (start, next, merge, pr, issue, priorities)
  - `scaffold:*` - Code generation (new-domain, new-endpoint)
  - `quality:*` - Code review automation
  - `db:*` - Database migration management
  - `workflow:*` - Complete workflow orchestration

- **3 Specialized Agents**:
  - `issue-planner` - Architecture planning and implementation proposals
  - `code-reviewer` - Pattern compliance review
  - `debugger` - Error diagnosis and resolution

- **18+ Code Templates**:
  - 10 backend templates (entities, use cases, repositories, models, routers, DTOs)
  - 4 frontend templates (entities, features, widgets, pages)
  - 4 issue templates (backend, frontend, fullstack, bug)
  - Settings template with complete Claude Code configuration

#### CLI Tool
- **Interactive Wizard** with 5-step setup process:
  1. Project information (name, description, version)
  2. Team configuration (owner, GitHub settings)
  3. Stack selection (backend, frontend, database)
  4. Business domains definition
  5. Workflow preferences (auto-implement, auto-review, auto-merge, require-tests)

- **6 JavaScript Modules** (1,148 lines):
  - `cli/lib/utils.js` - Naming conversions (PascalCase, snake_case, kebab-case), validations
  - `cli/lib/config-generator.js` - Generates claude.config.json with 30+ Mustache variables
  - `cli/lib/template-processor.js` - Recursive template processing with Mustache
  - `cli/lib/validator.js` - JSON Schema validation with AJV
  - `cli/lib/init.js` - Interactive wizard implementation
  - `cli/index.js` - CLI entry point with command routing

- **CLI Commands**:
  - `init <path>` - Initialize framework in existing project
  - `validate <config>` - Validate configuration file
  - `update <path>` - Update framework to latest version (planned)
  - `version` - Show CLI version
  - `help` - Show help documentation

#### Configuration
- **config/defaults.json** - Framework default values
- **config/schema.json** - JSON Schema for validation with AJV
- **Parametrization System** - 30+ Mustache variables for complete customization
- **Database Support** - MySQL, PostgreSQL, SQLite with flexible configuration

#### Documentation
- **README.md** - Main framework documentation (277 lines)
- **README-FIRST.md** - Quick start guide
- **INSTRUCCIONES.md** - Complete step-by-step guide
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details (586 lines)
- **QUICK_REFERENCE.md** - API reference (399 lines)
- **EXAMPLES.md** - 15 usage examples (570 lines)
- **MANIFEST.md** - Complete file listing (488 lines)
- **DELIVERY_SUMMARY.md** - Delivery checklist (377 lines)

#### Automation Scripts
- **SETUP.ps1** - Automated file copying from source project
- **PARAMETRIZE.ps1** - Replace hard-coded references with template variables
- **parametrize-simple.ps1** - Simplified parametrization script

### Fixed
- **CommonJS Compatibility** - Downgraded dependencies to support require/module.exports:
  - chalk: ^4.1.2 (was v5 ES modules)
  - inquirer: ^8.2.5 (was v9 ES modules)
  - ora: ^5.4.1 (was v6 ES modules)
- **JSON Schema Validation** - Set `additionalProperties: true` to allow framework metadata
- **PowerShell Path Handling** - Fixed Windows path separators in scripts
- **Template Processing** - Proper handling of .tmpl extension removal

### Changed
- **Framework Structure** - Organized into core/, cli/, config/, docs/ directories
- **Naming Conventions** - Strict enforcement of hexagonal and FSD patterns
- **Validation** - Business rule validation beyond JSON Schema (unique ports, valid domains)

### Security
- **0 Vulnerabilities** - All npm dependencies audited and secure
- **MIT License** - Open source with permissive licensing

### Performance
- **Recursive File Processing** - Efficient template processing with progress indicators
- **Parallel Operations** - CLI operations optimized for speed

### Testing
- **Verified with Real Project** - Successfully tested with CierreContable project
- **43 Files Processed** - Template processing validated across all framework files
- **PostgreSQL Support** - Confirmed database flexibility (MySQL → PostgreSQL)

### Notes
- Extracted from Gextiona Dashboard project after successful production use
- Complete framework with 94+ files and 4,000+ lines of code/documentation
- Ready for production use in hexagonal architecture + FSD projects
- Fully parametrized with zero hard-coded references

[1.0.2]: https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework/releases/tag/v1.0.0
