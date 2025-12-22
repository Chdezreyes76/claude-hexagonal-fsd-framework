# Claude Hexagonal+FSD Framework - CLI Tool

Interactive CLI tool for initializing the Claude Hexagonal+FSD Framework in new projects.

## Overview

This CLI provides an interactive wizard that:
- Collects project configuration through prompts
- Generates a validated `claude.config.json`
- Copies and processes framework files
- Sets up the `.claude` directory with all skills, commands, and agents
- Updates `.gitignore` with framework-specific entries

## Installation

**Important**: You must install dependencies before using the CLI.

```bash
cd cli
npm install
```

This will install:
- inquirer (interactive prompts)
- chalk (terminal colors)
- ora (loading spinners)
- fs-extra (file operations)
- ajv + ajv-formats (JSON validation)
- mustache (template processing)

## Usage

### Initialize in Current Directory

```bash
node index.js init
```

### Initialize in Specific Directory

```bash
node index.js init /path/to/your/project
```

### Verbose Output

```bash
node index.js init --verbose
```

## Wizard Steps

The interactive wizard will guide you through:

### 1. Project Information
- **Project name**: Your project's display name (e.g., "My Dashboard")
- **Description**: Optional project description
- **Initial version**: Semantic version (default: 1.0.0)

### 2. Team Information
- **Your name**: Your full name (optional)
- **Your email**: Your email address (required)
- **GitHub username/org**: GitHub account name (optional)
- **GitHub repository**: Repository name (optional)
- **Main branch**: Main branch name (default: main)

### 3. Technology Stack
- **Backend directory**: Backend folder name (default: backend)
- **Backend port**: Development port (default: 8000)
- **Frontend directory**: Frontend folder name (default: frontend)
- **Frontend port**: Development port (default: 3000)
- **Database type**: mysql or postgresql (default: mysql)
- **Database port**: Database port (default: 3306 for MySQL, 5432 for PostgreSQL)
- **Database name**: Database name in snake_case (auto-generated from project name)

### 4. Business Domains (Optional)
- Add initial business domain names
- Used as examples in skills and documentation
- Press Enter without input to skip

### 5. Customization
- **Enable QA automation**: Automated quality assurance (default: yes)
- **Enable email reports**: Send QA reports via email (default: no - local only)
- **Auto-implement issues**: Automatically implement issues (default: yes)
- **Auto-review code**: Automatically review code changes (default: yes)
- **Auto-merge PRs**: Automatically merge pull requests (default: no)
- **Require passing tests**: Require tests to pass before merge (default: no)

## What Gets Created

After running the wizard, your project will have:

```
your-project/
├── .claude/
│   ├── claude.config.json          # Your project configuration
│   ├── settings.json               # Framework settings
│   ├── settings.local.json         # Local settings (gitignored)
│   ├── agents/                     # AI agents (planner, reviewer, debugger)
│   ├── commands/                   # 20+ commands
│   │   ├── db/                    # Database commands
│   │   ├── github/                # GitHub integration commands
│   │   ├── quality/               # Code quality commands
│   │   ├── scaffold/              # Scaffolding commands
│   │   └── workflow/              # Workflow automation
│   ├── skills/                     # 11 specialized skills
│   │   ├── hexagonal-architecture/
│   │   ├── feature-sliced-design/
│   │   ├── backend-implementer/
│   │   ├── frontend-implementer/
│   │   ├── fullstack-implementer/
│   │   ├── issue-analyzer/
│   │   ├── test-runner/
│   │   ├── qa-review-done/
│   │   ├── github-workflow/
│   │   ├── alembic-migrations/
│   │   └── issue-workflow/
│   ├── hooks/                      # Claude Code hooks
│   ├── lib/                        # Utility libraries
│   └── qa-reports/                 # QA reports (gitignored)
└── .gitignore                      # Updated with .claude entries
```

## Configuration File

The wizard generates `claude.config.json` with:

```json
{
  "version": "1.0.0",
  "frameworkVersion": "1.0.0",
  "project": {
    "name": "My Dashboard",
    "nameSnake": "my_dashboard",
    "nameKebab": "my-dashboard",
    "description": "...",
    "version": "1.0.0"
  },
  "team": {
    "owner": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "github": {
      "owner": "johndoe",
      "repo": "my-dashboard",
      "mainBranch": "main"
    }
  },
  "stack": {
    "backend": { ... },
    "frontend": { ... },
    "database": { ... }
  },
  "domains": {
    "examples": ["users", "products"]
  },
  "paths": { ... },
  "qa": { ... },
  "workflows": { ... }
}
```

## Template Processing

The CLI uses Mustache to process template variables:

- `{{projectName}}` → "My Dashboard"
- `{{projectNameSnake}}` → "my_dashboard"
- `{{projectNameKebab}}` → "my-dashboard"
- `{{userEmail}}` → "john@example.com"
- `{{githubOwner}}` → "johndoe"
- `{{backendPort}}` → 8000
- `{{frontendPort}}` → 3000
- And many more...

All files in the framework are processed to replace these variables with your configuration.

## Validation

The CLI validates:
- **JSON Schema**: Configuration structure and types
- **Business Rules**:
  - Unique ports across services
  - Valid email format
  - Valid port ranges (1-65535)
  - Database name in snake_case
  - Domain names in lowercase with hyphens/underscores

Validation errors are shown before files are created.

## Files Modified

### `.gitignore`

The CLI adds these entries to your project's `.gitignore`:

```gitignore
# Claude Framework - Local reports
.claude/qa-reports/

# Claude Framework - Local settings (may contain secrets)
.claude/settings.local.json
```

## Module Structure

### `lib/utils.js`
Utility functions for naming conversions and validation:
- `generateNamingVariants()` - Convert to PascalCase, snake_case, kebab-case
- `generateDbName()` - Generate database name from project name
- `isValidEmail()` - Email validation
- `isValidPort()` - Port validation (1-65535)

### `lib/config-generator.js`
Configuration generation:
- `generateConfig()` - Generate complete config from wizard answers
- `generateTemplateVariables()` - Generate Mustache template variables
- `getDefaultDbPort()` - Get default port by database type

### `lib/template-processor.js`
Template processing with Mustache:
- `processTemplateFile()` - Process single template file
- `processTemplateDirectory()` - Process entire directory tree
- `processTemplateString()` - Process string template
- `hasTemplateVariables()` - Check if file has template variables
- `findTemplateFiles()` - Find all template files in directory

### `lib/validator.js`
Configuration validation:
- `validateConfig()` - Validate against JSON Schema
- `validateBusinessRules()` - Business logic validation
- `validateProjectStructure()` - Check project directories
- `formatValidationErrors()` - Format errors for display

### `lib/init.js`
Main wizard implementation:
- `initWizard()` - Run interactive wizard
- `setupClaudeDirectory()` - Setup .claude directory
- `updateGitignore()` - Update project .gitignore

### `index.js`
CLI entry point with command routing

### `bin/claude-framework`
Executable for npm bin

## Available Commands

### `init [path]`
Initialize framework in a project (interactive wizard)

### `update [path]`
Update existing framework installation (coming soon)

### `validate [path]`
Validate claude.config.json (coming soon)

### `version`
Show CLI version

### `help`
Show help message

## Development

### Testing the CLI

```bash
# Test in a dummy project
mkdir ../test-project
node index.js init ../test-project

# Test with verbose output
node index.js init ../test-project --verbose
```

### Making Changes

After modifying any lib files:
1. Test with a fresh project directory
2. Verify generated configuration
3. Check that all template variables are replaced
4. Validate against schema

## Dependencies

- **inquirer**: Interactive prompts
- **chalk**: Terminal colors and formatting
- **ora**: Spinners for loading states
- **fs-extra**: Enhanced file system operations
- **ajv**: JSON Schema validation
- **ajv-formats**: Additional validation formats (email, etc.)
- **mustache**: Template processing

## Error Handling

The CLI provides clear error messages for:
- Invalid configuration values
- Schema validation failures
- File system errors
- Template processing errors

Use `--verbose` flag for detailed error stack traces.

## Next Steps

After running the wizard:

1. Review `.claude/claude.config.json`
2. Explore available commands in `.claude/commands/`
3. Check skills in `.claude/skills/`
4. Start using Claude Code with the framework

## Support

For issues or questions:
- GitHub: https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework
- Documentation: See `/docs` in framework root
