# CLI Quick Reference

Fast reference for common tasks and patterns.

## Installation & Setup

```bash
cd cli
npm install
```

## Basic Usage

```bash
# Show help
node index.js help

# Show version
node index.js version

# Initialize in current directory
node index.js init

# Initialize in specific directory
node index.js init /path/to/project

# Verbose output
node index.js init --verbose
```

## Module Quick Reference

### utils.js

```javascript
const { generateNamingVariants, generateDbName, isValidEmail, isValidPort } = require('./lib/utils');

// Generate naming variants
const variants = generateNamingVariants('My Project');
// { original, pascal, snake, kebab }

// Generate database name
const dbName = generateDbName('My Project', 'mysql');
// 'my_project_dev'

// Validate email
isValidEmail('test@example.com'); // true

// Validate port
isValidPort(8000); // true
```

### config-generator.js

```javascript
const { generateConfig, generateTemplateVariables } = require('./lib/config-generator');

// Generate config from wizard answers
const config = await generateConfig(answers, frameworkRoot);

// Generate template variables for Mustache
const vars = generateTemplateVariables(config);
// { projectName, projectNameSnake, userEmail, ... }
```

### template-processor.js

```javascript
const { processTemplateFile, processTemplateDirectory } = require('./lib/template-processor');

// Process single file
await processTemplateFile(
  'path/to/template.tmpl',
  'path/to/output.txt',
  { projectName: 'MyProject' }
);

// Process directory
const results = await processTemplateDirectory(
  'source/dir',
  'target/dir',
  variables,
  { removeTmplExtension: true }
);
// { processed: [], copied: [], errors: [] }
```

### validator.js

```javascript
const { validateConfig, validateProjectStructure, formatValidationErrors } = require('./lib/validator');

// Validate configuration
const result = await validateConfig(config, schemaPath);
// { valid: true/false, errors: [...] }

// Validate project structure
const structResult = await validateProjectStructure(projectRoot, config);
// { valid: true/false, errors: [], warnings: [] }

// Format errors
console.log(formatValidationErrors(result.errors));
```

### init.js

```javascript
const { initWizard, setupClaudeDirectory, updateGitignore } = require('./lib/init');

// Run wizard
await initWizard('/path/to/project', { frameworkRoot, verbose: true });

// Setup .claude directory
await setupClaudeDirectory(projectRoot, frameworkRoot, config, options);

// Update .gitignore
await updateGitignore(projectRoot);
```

## Template Variables

All variables available in Mustache templates:

### Project
- `{{projectName}}` - "My Dashboard"
- `{{projectNameSnake}}` - "my_dashboard"
- `{{projectNameKebab}}` - "my-dashboard"
- `{{projectDescription}}` - Description text
- `{{projectVersion}}` - "1.0.0"

### Team
- `{{userName}}` - "John Doe"
- `{{userEmail}}` - "john@example.com"
- `{{githubOwner}}` - "johndoe"
- `{{githubRepo}}` - "my-dashboard"
- `{{mainBranch}}` - "main"

### Backend
- `{{backendLanguage}}` - "python"
- `{{backendVersion}}` - "3.11"
- `{{backendFramework}}` - "fastapi"
- `{{backendDir}}` - "backend"
- `{{backendPort}}` - 8000

### Frontend
- `{{frontendLanguage}}` - "typescript"
- `{{frontendFramework}}` - "react"
- `{{frontendVersion}}` - "19"
- `{{frontendDir}}` - "frontend"
- `{{frontendPort}}` - 3000

### Database
- `{{dbType}}` - "mysql"
- `{{dbVersion}}` - "8.0"
- `{{dbName}}` - "my_dashboard_dev"
- `{{dbPort}}` - 3306

### Paths
- `{{backendRoot}}` - "./backend"
- `{{frontendRoot}}` - "./frontend"

### Domains
- `{{domainExamples}}` - "users, products, orders"
- `{{domainExamplesArray}}` - ["users", "products", "orders"]

### QA & Workflows
- `{{qaEnabled}}` - true/false
- `{{qaEmailReports}}` - true/false
- `{{qaReportPath}}` - "./.claude/qa-reports"
- `{{autoImplement}}` - true/false
- `{{autoReview}}` - true/false
- `{{autoMerge}}` - true/false
- `{{requireTests}}` - true/false

### Metadata
- `{{frameworkVersion}}` - "1.0.0"
- `{{generatedDate}}` - "2025-12-21"

## Configuration Schema

Minimal required config:

```json
{
  "project": {
    "name": "My Project"
  },
  "team": {
    "owner": {
      "email": "dev@example.com"
    }
  }
}
```

Full config example:

```json
{
  "version": "1.0.0",
  "frameworkVersion": "1.0.0",
  "project": {
    "name": "My Dashboard",
    "nameSnake": "my_dashboard",
    "nameKebab": "my-dashboard",
    "description": "Cost management dashboard",
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
    "backend": {
      "language": "python",
      "version": "3.11",
      "framework": "fastapi",
      "architecture": "hexagonal",
      "dirName": "backend",
      "port": 8000
    },
    "frontend": {
      "language": "typescript",
      "framework": "react",
      "version": "19",
      "architecture": "feature-sliced-design",
      "dirName": "frontend",
      "port": 3000
    },
    "database": {
      "type": "mysql",
      "version": "8.0",
      "name": "my_dashboard_dev",
      "port": 3306,
      "migrations": "alembic"
    }
  },
  "domains": {
    "examples": ["users", "products", "orders"]
  },
  "paths": {
    "backend": {
      "root": "./backend",
      "domain": "./backend/domain",
      "application": "./backend/application",
      "adapter": "./backend/adapter"
    },
    "frontend": {
      "root": "./frontend",
      "src": "./frontend/src"
    }
  },
  "qa": {
    "enabled": true,
    "emailReports": false,
    "localReportPath": "./.claude/qa-reports"
  },
  "workflows": {
    "autoImplement": true,
    "autoReview": true,
    "autoMerge": false,
    "requireTests": false
  }
}
```

## Validation Rules

### Required Fields
- `project.name` - Max 100 chars
- `team.owner.email` - Valid email format

### Auto-generated (if not provided)
- `project.nameSnake` - From project.name
- `project.nameKebab` - From project.name
- `team.github.repo` - From project.nameKebab
- `stack.database.name` - From project.name + "_dev"

### Constraints
- Ports: 1-65535, must be unique
- Email: Valid format (regex)
- Database name: snake_case only
- Domain names: lowercase with hyphens/underscores
- Versions: Semantic versioning (X.Y.Z)

## Common Patterns

### Add New Template Variable

1. Add to config-generator.js:
```javascript
// In generateTemplateVariables()
myNewVar: config.some.value,
```

2. Use in template:
```markdown
This is {{myNewVar}}
```

### Add New Validation Rule

```javascript
// In validator.js::validateBusinessRules()
if (config.some?.value) {
  if (/* validation check */) {
    errors.push({
      path: '/some/value',
      message: 'Error message',
      params: { value: config.some.value }
    });
  }
}
```

### Add New Wizard Step

```javascript
// In init.js::initWizard()
const newAnswers = await inquirer.prompt([
  {
    type: 'input',
    name: 'fieldName',
    message: 'Question?',
    default: 'default value',
    validate: (input) => {
      if (/* invalid */) return 'Error message';
      return true;
    }
  }
]);

// Add to allAnswers
const allAnswers = {
  ...existingAnswers,
  ...newAnswers
};
```

## Troubleshooting

### Module not found
```bash
# Install dependencies
npm install
```

### Invalid email format
```
Use format: user@domain.com
```

### Port already in use
```
Change port in wizard or edit claude.config.json
```

### Template processing error
```
Check for:
- Unmatched {{ or }}
- Invalid Mustache syntax
- Binary files in wrong directory
```

### Validation failed
```bash
# Run with verbose to see details
node index.js init --verbose
```

## Testing Checklist

- [ ] Help command shows
- [ ] Version command shows
- [ ] Init wizard completes
- [ ] .claude directory created
- [ ] claude.config.json is valid JSON
- [ ] No template variables ({{...}}) in output
- [ ] .gitignore updated
- [ ] qa-reports directory exists
- [ ] All files copied
- [ ] No "Gextiona" references

## File Structure After Init

```
project/
├── .claude/
│   ├── claude.config.json       ← Generated config
│   ├── settings.json            ← Framework settings
│   ├── settings.local.json      ← Local settings (gitignored)
│   ├── agents/                  ← 3 agents
│   ├── commands/                ← 20+ commands
│   ├── skills/                  ← 11 skills
│   ├── hooks/                   ← Hooks
│   ├── lib/                     ← Utils
│   └── qa-reports/              ← Reports (gitignored)
└── .gitignore                   ← Updated
```

## Performance Tips

- Template processing: ~10-20ms per file
- Total setup time: 2-10 seconds
- For large frameworks: Consider caching processed templates

## Security Notes

- Never commit `.claude/settings.local.json`
- Never commit `.claude/qa-reports/`
- Config file is safe to commit
- No secrets in generated config
- Validate all user input

## Next Steps After Init

1. Review `.claude/claude.config.json`
2. Check `.claude/commands/` for available commands
3. Explore `.claude/skills/` for framework skills
4. Read `.claude/agents/` to understand AI helpers
5. Start using with Claude Code

## Support

- GitHub: https://github.com/yourorg/claude-hexagonal-fsd-framework
- Issues: https://github.com/yourorg/claude-hexagonal-fsd-framework/issues
- Docs: See `/docs` in framework root
