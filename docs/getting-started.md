# Getting Started with Claude Hexagonal+FSD Framework

A comprehensive guide to set up and start using the Claude Hexagonal+FSD Framework for your full-stack projects.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 18.x or higher (for CLI tools)
- **Git**: 2.x or higher
- **Python**: 3.11 or higher (for backend development)
- **Docker** (optional, recommended for development)
- **Claude Code**: The Claude Code extension for your IDE

## Installation

### Option 1: Git Submodule (Recommended)

This approach allows you to receive updates to the framework while maintaining your project independence.

```bash
# Clone your project
git clone <your-project-repo>
cd <your-project>

# Add framework as a submodule
git submodule add https://github.com/yourorg/claude-hexagonal-fsd-framework .claude-framework

# Navigate to CLI and install dependencies
cd .claude-framework/cli
npm install

# Run initialization wizard
node index.js init ../..
```

### Option 2: Direct Clone

For standalone projects not using git submodules:

```bash
# Clone the framework
git clone https://github.com/yourorg/claude-hexagonal-fsd-framework
cd claude-hexagonal-fsd-framework/cli

# Install dependencies
npm install

# Initialize in your project directory
node index.js init /path/to/your/project
```

### Option 3: NPM Package (Future)

Once published to NPM:

```bash
npm install -g @claude-framework/cli
claude-framework init
```

## Interactive Setup

The framework includes an interactive CLI wizard that guides you through configuration:

```bash
cd .claude-framework/cli
node index.js init

# Or with npm globally installed:
claude-framework init
```

The wizard will ask you:

1. **Project Information**
   - Project name
   - Description
   - Initial version

2. **Team Information**
   - Your name
   - Your email
   - GitHub username/organization
   - GitHub repository name

3. **Technology Stack**
   - Backend directory name (default: `backend`)
   - Backend port (default: `8000`)
   - Frontend directory name (default: `frontend`)
   - Frontend port (default: `3000`)
   - Database type (MySQL, PostgreSQL)
   - Database port
   - Database name

4. **Initial Business Domains** (Optional)
   - Add business domains for your project (e.g., users, products, orders)

5. **Customization**
   - Enable QA automation
   - Enable email reports
   - Auto-implement issues
   - Auto-review code
   - Auto-merge PRs
   - Require passing tests

## What Gets Generated

After initialization, your project will have:

```
your-project/
├── .claude/
│   ├── claude.config.json           # Your project configuration
│   ├── settings.json                # Framework settings
│   ├── agents/                      # 3 specialized agents
│   ├── commands/                    # 20+ slash commands
│   ├── skills/                      # 11 knowledge bases
│   ├── hooks/                       # Pre-commit hooks
│   ├── lib/templates/               # Code generation templates
│   └── qa-reports/                  # QA reports (git-ignored)
│
├── .gitignore                       # Updated with .claude entries
└── README.md                        # Updated with framework docs
```

## Configuration File

The `claude.config.json` file stores your project configuration:

```json
{
  "version": "1.0.0",
  "project": {
    "name": "My Project",
    "nameSnake": "my_project",
    "nameKebab": "my-project"
  },
  "team": {
    "owner": {
      "email": "dev@example.com"
    },
    "github": {
      "owner": "myorg",
      "repo": "my-project",
      "mainBranch": "main"
    }
  },
  "stack": {
    "backend": {
      "framework": "fastapi",
      "dirName": "backend",
      "port": 8000
    },
    "frontend": {
      "framework": "react",
      "dirName": "frontend",
      "port": 3000
    },
    "database": {
      "type": "mysql",
      "name": "my_project_dev"
    }
  }
}
```

## Available Commands

Once initialized, you have access to slash commands in Claude Code:

### GitHub Commands
```bash
/github:next                    # Start work on next priority issue
/github:start <issue-number>    # Start work on specific issue
/github:pr                      # Create pull request
/github:merge                   # Merge PR and cleanup
/github:issue                   # Create new issue
/github:priorities              # Show top 3 priority issues
```

### Scaffold Commands
```bash
/scaffold:new-domain <name>     # Create complete domain (backend + frontend)
/scaffold:new-endpoint <name>   # Add endpoint to existing domain
```

### Quality Commands
```bash
/quality:review                 # Automated code review
```

### Workflow Commands
```bash
/workflow:issue-complete        # Complete workflow from issue to merge
```

### Database Commands
```bash
/db:migrate                     # Manage database migrations
```

## Quick Start: Create Your First Domain

Let's create a simple "users" domain:

```bash
# In Claude Code, run:
/scaffold:new-domain users
```

This will generate:

**Backend**:
- Entity: `backend/domain/entities/usuario.py`
- DTOs: `backend/application/dtos/usuarios/`
- Port: `backend/application/ports/usuarios/usuario_port.py`
- Use Cases: `backend/application/use_cases/usuarios/`
- Repository: `backend/adapter/outbound/database/repositories/usuario_repository.py`
- Model: `backend/adapter/outbound/database/models/usuario_model.py`
- Router: `backend/adapter/inbound/api/routers/usuario_router.py`
- Dependencies: `backend/adapter/inbound/api/dependencies/usuarios/`

**Frontend**:
- Types: `frontend/src/entities/usuario/model/types.ts`
- Service: `frontend/src/services/usuario.service.ts`
- Hook: `frontend/src/hooks/useUsuario.ts`
- Page: `frontend/src/pages/UsuarioPage.tsx`

**Database**:
- Migration will be generated automatically

## Architecture Overview

### Backend: Hexagonal Architecture

The backend follows Hexagonal Architecture (Ports & Adapters) pattern:

```
backend/
├── domain/              # Pure business logic (entities)
├── application/         # Use cases and interfaces (ports)
├── adapter/
│   ├── inbound/         # API endpoints (routers)
│   └── outbound/        # Database (repositories) and external services
└── core/                # Infrastructure (database, logging, security)
```

Data flow:
1. Request → Router (adapter/inbound)
2. Router → Use Case (application/use_cases)
3. Use Case → Port Interface (application/ports)
4. Port → Repository (adapter/outbound/database)
5. Repository → Database Model

### Frontend: Feature-Sliced Design

The frontend follows Feature-Sliced Design (FSD) pattern:

```
frontend/src/
├── components/          # Reusable UI components
├── entities/            # Business domain types and API clients
├── features/            # Feature-specific logic (hooks, utilities)
├── widgets/             # Composed components
├── pages/               # Page components
├── hooks/               # Shared custom hooks
├── services/            # API clients
├── contexts/            # React contexts
├── lib/                 # Utilities and helpers
└── router/              # Routing configuration
```

Dependency rules (top-level can import from lower-level, but not vice versa):
- Pages ← Widgets ← Features ← Entities ← Components

## Next Steps

1. **Configure Your Project**: Edit `.claude/claude.config.json` with your project details
2. **Add Business Domains**: Use `/scaffold:new-domain` to create new domains
3. **Run Tests**: Set up tests for your code
4. **Enable CI/CD**: Configure GitHub Actions or other CI/CD
5. **Read Architecture Guides**: Check [hexagonal architecture](./architecture/hexagonal-backend.md) and [FSD guide](./architecture/fsd-frontend.md)

## Troubleshooting

### CLI not working
```bash
# Make sure you're in the right directory
cd .claude-framework/cli
npm install
node index.js init ../..
```

### Configuration errors
```bash
# Validate your configuration
node index.js validate ../..
```

### Framework updates
```bash
# Check for updates
node index.js update --check ../..

# Update framework
node index.js update ../..
```

## Support

For issues, questions, or feature requests:
- Check the [Configuration Reference](./configuration.md)
- Read the [CLI Reference](./cli-reference.md)
- Visit [GitHub Issues](https://github.com/yourorg/claude-hexagonal-fsd-framework/issues)

## License

MIT

---

Happy developing! 🚀
