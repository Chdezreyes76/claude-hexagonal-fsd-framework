# CLI Usage Examples

Practical examples for using the Claude Hexagonal+FSD Framework CLI.

## Example 1: Basic Interactive Setup

```bash
# Navigate to your project
cd /path/to/my-new-project

# Initialize with wizard
node /path/to/framework/cli/index.js init

# Follow the prompts:
# 1. Project name: My Dashboard
# 2. Description: Analytics dashboard
# 3. Version: 1.0.0
# 4. Your email: john@example.com
# 5. GitHub owner: johndoe
# 6. GitHub repo: my-dashboard
# ... continue with defaults or customize

# Result: .claude directory created with full framework
```

## Example 2: Initialize From Framework Subdirectory

```bash
# Clone framework
git clone https://github.com/yourorg/claude-hexagonal-fsd-framework

# Go to your project
cd my-project

# Initialize from framework CLI
node ../claude-hexagonal-fsd-framework/cli/index.js init .
```

## Example 3: Git Submodule Approach

```bash
# Add framework as submodule
cd my-project
git submodule add https://github.com/yourorg/claude-framework .claude-framework
cd .claude-framework/cli

# Install CLI dependencies
npm install

# Initialize in parent project
node index.js init ../..

# Result: .claude directory in my-project root
```

## Example 4: Minimal Configuration

When prompted, use these minimal answers:

```
Project name: TodoApp
Description: [Enter to skip]
Version: [Enter for 1.0.0]
Your name: [Enter to skip]
Your email: dev@example.com
GitHub owner: [Enter to skip]
GitHub repo: [Enter to skip]
Main branch: [Enter for main]
Backend directory: [Enter for backend]
Backend port: [Enter for 8000]
Frontend directory: [Enter for frontend]
Frontend port: [Enter for 3000]
Database type: [Select mysql]
Database port: [Enter for 3306]
Database name: [Enter for todo_app_dev]
Add domain: [Enter to skip]
Enable QA: [Enter for yes]
Email reports: [Enter for no]
Auto-implement: [Enter for yes]
Auto-review: [Enter for yes]
Auto-merge: [Enter for no]
Require tests: [Enter for no]
```

Result:
```json
{
  "project": {
    "name": "TodoApp",
    "nameSnake": "todo_app",
    "nameKebab": "todo-app"
  },
  "team": {
    "owner": {
      "email": "dev@example.com"
    }
  }
  // ... rest with defaults
}
```

## Example 5: E-commerce Project

Full configuration example:

```
Project name: ShopHub
Description: E-commerce platform for small businesses
Version: 1.0.0
Your name: Jane Developer
Your email: jane@shophub.com
GitHub owner: shophub-team
GitHub repo: shophub-platform
Main branch: main
Backend directory: backend
Backend port: 8000
Frontend directory: frontend
Frontend port: 3000
Database type: postgresql
Database port: 5432
Database name: shophub_dev
Add domain: products
Add domain: orders
Add domain: customers
Add domain: payments
Add domain: [Enter to finish]
Enable QA: yes
Email reports: no
Auto-implement: yes
Auto-review: yes
Auto-merge: no
Require tests: yes
```

Result:
```json
{
  "project": {
    "name": "ShopHub",
    "description": "E-commerce platform for small businesses",
    "version": "1.0.0"
  },
  "team": {
    "owner": {
      "name": "Jane Developer",
      "email": "jane@shophub.com"
    },
    "github": {
      "owner": "shophub-team",
      "repo": "shophub-platform"
    }
  },
  "stack": {
    "database": {
      "type": "postgresql",
      "port": 5432,
      "name": "shophub_dev"
    }
  },
  "domains": {
    "examples": ["products", "orders", "customers", "payments"]
  },
  "workflows": {
    "requireTests": true
  }
}
```

## Example 6: Using with Existing Project Structure

```bash
# Your existing project
my-saas/
├── api/              # Backend (non-standard name)
├── web/              # Frontend (non-standard name)
└── package.json

# Initialize with custom directories
cd my-saas
node ../framework/cli/index.js init

# When prompted:
Backend directory: api
Frontend directory: web
# ... continue

# Result: Framework adapts to your structure
```

Generated config:
```json
{
  "stack": {
    "backend": {
      "dirName": "api"
    },
    "frontend": {
      "dirName": "web"
    }
  },
  "paths": {
    "backend": {
      "root": "./api",
      "domain": "./api/domain",
      "application": "./api/application",
      "adapter": "./api/adapter"
    },
    "frontend": {
      "root": "./web",
      "src": "./web/src"
    }
  }
}
```

## Example 7: Verbose Mode for Debugging

```bash
# Run with verbose output
node index.js init /path/to/project --verbose

# Shows:
# - Full error stack traces
# - Detailed template processing
# - File-by-file progress
# - Configuration generation steps
```

## Example 8: Quick Commands

```bash
# Show help
node index.js help

# Show version
node index.js version

# Initialize current directory
node index.js init

# Initialize parent directory
node index.js init ..

# Initialize specific path
node index.js init ~/projects/new-app
```

## Example 9: Programmatic Usage

Use the CLI modules in your own scripts:

```javascript
// custom-setup.js
const path = require('path');
const { generateConfig, generateTemplateVariables } = require('./cli/lib/config-generator');
const { validateConfig } = require('./cli/lib/validator');

async function customSetup() {
  const frameworkRoot = path.resolve(__dirname);

  // Define answers (skip wizard)
  const answers = {
    projectName: 'MyApp',
    userEmail: 'dev@example.com',
    backendPort: '8000',
    frontendPort: '3000',
    dbType: 'mysql',
    // ... other fields
  };

  // Generate config
  const config = await generateConfig(answers, frameworkRoot);

  // Validate
  const schemaPath = path.join(frameworkRoot, 'config', 'schema.json');
  const validation = await validateConfig(config, schemaPath);

  if (validation.valid) {
    console.log('Config is valid!');
    console.log(JSON.stringify(config, null, 2));
  } else {
    console.error('Validation errors:', validation.errors);
  }
}

customSetup();
```

## Example 10: CI/CD Integration

Use in continuous integration:

```yaml
# .github/workflows/setup.yml
name: Setup Framework

on:
  workflow_dispatch:
    inputs:
      project_name:
        description: 'Project name'
        required: true
      email:
        description: 'Team email'
        required: true

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Clone Framework
        run: |
          git clone https://github.com/yourorg/claude-framework
          cd claude-framework/cli
          npm install

      # Note: For CI, you'd need non-interactive mode (future enhancement)
      # For now, create config manually:
      - name: Create Config
        run: |
          cat > .claude/claude.config.json << EOF
          {
            "project": {
              "name": "${{ github.event.inputs.project_name }}"
            },
            "team": {
              "owner": {
                "email": "${{ github.event.inputs.email }}"
              }
            }
          }
          EOF
```

## Example 11: Multi-Environment Setup

Setup different configs for dev/staging/prod:

```bash
# Initialize base
node cli/index.js init

# Create environment-specific configs
cp .claude/claude.config.json .claude/claude.config.dev.json
cp .claude/claude.config.json .claude/claude.config.staging.json
cp .claude/claude.config.json .claude/claude.config.prod.json

# Modify each for environment
# dev: requireTests: false
# staging: requireTests: true, autoMerge: false
# prod: requireTests: true, autoMerge: false, autoImplement: false
```

## Example 12: Testing Setup

Verify the setup worked:

```bash
# After running init
cd my-project

# Check .claude directory
ls -la .claude/

# Verify config
cat .claude/claude.config.json

# Check no template variables remain
grep -r "{{" .claude/ | grep -v node_modules

# Verify skills
ls .claude/skills/

# Check commands
ls .claude/commands/

# Verify .gitignore
grep ".claude" .gitignore
```

## Example 13: Custom Domains Setup

For a healthcare app:

```
Add domain: patients
Add domain: appointments
Add domain: doctors
Add domain: medical-records
Add domain: billing
Add domain: insurance
Add domain: prescriptions
```

These domains appear in:
- Skill examples
- Command documentation
- Template suggestions
- Generated documentation

## Example 14: Clean Reinstall

If you need to reset:

```bash
# Backup current config
cp .claude/claude.config.json ../claude.config.backup.json

# Remove .claude
rm -rf .claude/

# Reinstall
node ../framework/cli/index.js init

# Restore config if needed
cp ../claude.config.backup.json .claude/claude.config.json
```

## Example 15: Framework Update (Future)

When update command is implemented:

```bash
# Check for updates
node cli/index.js update --check

# Update framework (preserves config)
node cli/index.js update

# Force update (overwrites customizations)
node cli/index.js update --force
```

## Common Scenarios

### Scenario: Starting New Project

```bash
mkdir my-new-project
cd my-new-project
git init
node ../claude-framework/cli/index.js init
# Follow wizard
git add .claude/
git commit -m "Initialize Claude framework"
```

### Scenario: Adding to Existing Project

```bash
cd existing-project
node ../claude-framework/cli/index.js init
# Answer questions based on existing structure
git add .claude/ .gitignore
git commit -m "Add Claude framework"
```

### Scenario: Team Collaboration

```bash
# Team member 1 (setup)
node ../framework/cli/index.js init
git add .claude/
git commit -m "Add framework"
git push

# Team member 2 (clone)
git clone repo
cd repo
# .claude directory already configured
# Start using immediately
```

## Troubleshooting Examples

### Port Conflict

```bash
# Error: Port 8000 already in use by frontend
# Solution: Use different ports in wizard
Backend port: 8080
Frontend port: 3000
```

### Invalid Email

```bash
# Error: Invalid email format
# Wrong: john@localhost
# Correct: john@example.com
```

### Database Name

```bash
# Error: Database name must be snake_case
# Wrong: MyApp-Dev
# Correct: my_app_dev
```

## Best Practices

1. **Use meaningful domain names**
   - Good: users, products, orders
   - Bad: domain1, test, foo

2. **Follow naming conventions**
   - Project: "My Dashboard" (human-readable)
   - Database: "my_dashboard_dev" (snake_case)
   - Repo: "my-dashboard" (kebab-case)

3. **Choose appropriate ports**
   - Backend: 8000-9000 range
   - Frontend: 3000-4000 range
   - Database: Standard (3306, 5432)

4. **Configure workflows carefully**
   - Dev: autoMerge: false (safety)
   - CI: requireTests: true
   - Prod: autoImplement: false (manual control)

5. **Document your config**
   - Add project description
   - List all team members
   - Note business domains

## Next Steps After Setup

1. ✓ Framework initialized
2. Review `.claude/claude.config.json`
3. Explore `.claude/commands/`
4. Read skill documentation in `.claude/skills/`
5. Start using with Claude Code:
   - `/scaffold:new-domain users`
   - `/github:next`
   - `/workflow:issue-complete`
