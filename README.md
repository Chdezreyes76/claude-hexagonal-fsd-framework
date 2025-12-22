# Claude Hexagonal+FSD Framework

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/github/v/tag/Chdezreyes76/claude-hexagonal-fsd-framework?label=version&color=green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-lightgrey.svg)

![Python](https://img.shields.io/badge/Python-3.11-3776ab.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Hexagonal-009688.svg?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-FSD-3178c6.svg?logo=typescript&logoColor=white)

![Status](https://img.shields.io/badge/status-stable-success.svg)
![Maintenance](https://img.shields.io/badge/maintained-yes-success.svg)
![GitHub Stars](https://img.shields.io/github/stars/Chdezreyes76/claude-hexagonal-fsd-framework?style=social)

Comprehensive development automation framework for building full-stack applications with:
- **Backend**: FastAPI + Hexagonal Architecture (Ports & Adapters)
- **Frontend**: React 19 + TypeScript + Feature-Sliced Design
- **Automation**: 11 skills, 20+ commands, 3 agents, 30+ templates
- **Docker**: Production-ready development environment with MySQL/SQLite support

## Features

- 🚀 **Zero-Config Initialization**: Interactive wizard generates 100% functional projects
- 🐳 **Docker Ready**: Complete dev environment with hot reload (MySQL/SQLite support)
- 🤖 **Automated Agents**: Issue planning, implementation, code review
- 📝 **Code Generation**: 30+ templates for backend, frontend, and infrastructure
- ✅ **Quality Assurance**: Automated QA with detailed reports
- 🔄 **GitHub Workflows**: Issue-to-deployment automation
- 🎨 **Slash Commands**: 20+ productivity commands

## Quick Start

### Create a New Project

```bash
# 1. Clone the framework
git clone https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework
cd claude-hexagonal-fsd-framework

# 2. Run the initialization wizard
node cli/index.js init /path/to/new/project

# 3. Follow the interactive prompts:
#    - Project details (name, description, version)
#    - Stack configuration (ports, database type)
#    - Optional scaffolding (Docker, backend core, domain examples)

# 4. Start the development environment
cd /path/to/new/project
./scripts/docker-start.sh   # Linux/Mac
# or
.\scripts\docker-start.bat  # Windows
```

### What You Get

After initialization, your project includes:

✅ **Backend (FastAPI + Hexagonal Architecture)**
- Complete hexagonal structure (domain, application, adapter layers)
- Database infrastructure (SQLAlchemy + Alembic migrations)
- Logging system with context tracking
- Settings management with environment variables
- Health check endpoints

✅ **Frontend (React 19 + TypeScript + FSD)**
- Vite dev server with Hot Module Replacement
- Feature-Sliced Design architecture
- TypeScript strict mode configuration
- React Query + Axios for API calls
- ESLint configuration

✅ **Docker Development Environment**
- MySQL or SQLite database (your choice)
- Backend with auto-reload on code changes
- Frontend with Vite HMR
- Health checks and dependency management
- Ready-to-use scripts for all platforms

**Access URLs after `docker-start`:**
- Frontend: http://localhost:3000 (or your configured port)
- Backend API: http://localhost:8000 (or your configured port)
- API Docs: http://localhost:8000/docs
- Database: localhost:3306 (MySQL) or embedded (SQLite)

## Autonomous Workflow ⭐ NEW

Resolve issues automatically with zero manual intervention:

```bash
# Basic autonomous mode - resolves up to 20 issues from project #7
/workflow:issue-complete --loop --max=20 --project=7 --autonomous
```

**What happens**:
1. 🎯 Auto-selects highest priority issue
2. 🔍 Analyzes files to classify (backend/frontend/fullstack)
3. 🤖 Implements changes automatically
4. ✅ Creates PR with auto-generated description
5. 🔎 Runs code review (architecture validation)
6. 🎉 Merges if approved
7. 🔄 Repeats with next issue

**For complex issues**:
- Retries 3 times with different approaches
- If still fails → Converts to **Epic** with sub-issues
- Creates GitHub project with manageable tasks
- Continues with other issues (0% loss rate)

**Typical results** (20 issues in ~2-3 hours):
- ✅ 16 completed (80%)
- 🎯 3 converted to Epics (15%)
- ⚠️ 1 skipped (5%)

## Architecture

- [Hexagonal Architecture Guide](docs/architecture/hexagonal-backend.md)
- [Feature-Sliced Design Guide](docs/architecture/fsd-frontend.md)

## Documentation

- [Getting Started](docs/getting-started.md)
- [Configuration Reference](docs/configuration.md)
- [CLI Reference](docs/cli-reference.md)
- [Migration Guide](docs/migration-guide.md)

## Framework Components

### Skills (11 total)
- `hexagonal-architecture`: Backend Hexagonal patterns
- `feature-sliced-design`: Frontend FSD patterns
- `backend-implementer`: Auto-implements backend issues
- `frontend-implementer`: Auto-implements frontend issues
- `fullstack-implementer`: Coordinates backend + frontend
- `issue-analyzer`: Detects issue type semantically
- `test-runner`: Validates tests before commits
- `qa-review-done`: Automated QA reviews
- `github-workflow`: GitHub conventions
- `alembic-migrations`: Database migration patterns
- `issue-workflow`: Complete issue orchestration

### Commands (20+)

**GitHub Workflow**
- `/github:issue` - Create GitHub issues
- `/github:start` - Start work on issue
- `/github:pr` - Create Pull Request
- `/github:merge` - Merge PR and cleanup
- `/github:next` - Start next priority issue
- `/github:priorities` - Analyze top 3 priority issues
- `/github:epic-breakdown` - Convert complex issue to Epic with sub-issues ⭐ NEW

**Scaffolding**
- `/scaffold:backend-core` - Generate core infrastructure (database, logging, settings)
- `/scaffold:docker-dev` - Create Docker development environment
- `/scaffold:new-domain` - Create complete domain (backend + frontend)
- `/scaffold:new-endpoint` - Add endpoint to existing domain

**Quality & Testing**
- `/quality:review` - Automated code review
- `/qa:review-done` - Automated QA review for issues in Done with network analysis

**Database**
- `/db:migrate` - Manage Alembic database migrations

**Workflows**
- `/workflow:issue-complete` - Full issue workflow (implement → review → merge → next)
- `/workflow:issue-complete --autonomous` - Fully autonomous loop mode ⭐ NEW

### Agents (3 total)
- `issue-planner`: Analyzes and proposes implementation plans
- `code-reviewer`: Reviews code against architecture patterns
- `debugger`: Diagnostics and error resolution

## Version

- **Current**: 1.1.0
- **Status**: Stable
- **Release Date**: December 2025

### What's New in 1.1.0

🚀 **Complete Project Initialization Wizard**
- Interactive CLI wizard for zero-config project setup
- Generates 100% functional full-stack applications
- No manual configuration needed - Docker ready immediately

🐳 **Docker Development Environment**
- Complete docker-compose setup with MySQL or SQLite
- Auto-rebuild on start (--build flag) prevents cache issues
- Health checks and dependency management
- Cross-platform scripts (Windows, Linux, Mac)

🤖 **Autonomous Workflow Mode** ⭐ NEW
- Fully automated issue resolution with `/workflow:issue-complete --autonomous`
- Auto-selects highest priority issues without user intervention
- Deep file analysis for 90%+ classification accuracy
- **Epic Breakdown**: Converts complex issues into manageable sub-issues
- Smart retry logic (3 attempts) before creating Epics
- Zero issues lost - everything gets resolved eventually
- Example: `/workflow:issue-complete --loop --max=20 --project=7 --autonomous`

📝 **Enhanced Code Generation**
- 30+ production-ready templates
- Backend core infrastructure scaffolding
- Frontend initial structure with React 19 + Vite
- Domain scaffolding with complete backend + frontend

🔧 **Infrastructure Improvements**
- Logging system with context tracking
- Settings management with Pydantic
- Database migrations with Alembic
- CORS configuration and security middleware
- Network request validation in QA reviews (POST/PUT/DELETE analysis)

### Previous Releases

**1.0.4** - Backend core scaffolding command
**1.0.3** - Multi-database support
**1.0.2** - Initial stable release

## License

MIT

## Support

For issues and feature requests, visit the [GitHub repository](https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework).

---

**Claude Hexagonal+FSD Framework** - Bringing enterprise-grade automation to your development workflow.
