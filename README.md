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
- **Automation**: 11 skills, 20+ commands, 3 agents, 18+ templates

## Features

- 🤖 **Automated Agents**: Issue planning, implementation, code review
- 📝 **Code Generation**: 18+ templates for backend & frontend
- ✅ **Quality Assurance**: Automated QA with detailed reports
- 🔄 **GitHub Workflows**: Issue-to-deployment automation
- 🎨 **Slash Commands**: 20+ productivity commands

## Quick Start

### Installation

```bash
# Clone the framework
git clone https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework
cd claude-hexagonal-fsd-framework/cli

# Install dependencies
npm install

# Initialize in your project
node index.js init /path/to/your/project
```

### Interactive Setup

```bash
# Run the wizard
claude-framework init

# Follow the prompts to configure your project
```

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
- `/github:issue` - Create GitHub issues
- `/github:start` - Start work on issue
- `/github:pr` - Create Pull Request
- `/github:merge` - Merge PR and cleanup
- `/github:next` - Start next priority issue
- `/scaffold:new-domain` - Create new domain
- `/scaffold:new-endpoint` - Add endpoint to domain
- `/quality:review` - Automated code review
- `/qa:review-done` - Automated QA review for issues in Done
- `/db:migrate` - Manage database migrations
- `/workflow:issue-complete` - Full issue workflow

### Agents (3 total)
- `issue-planner`: Analyzes and proposes implementation plans
- `code-reviewer`: Reviews code against architecture patterns
- `debugger`: Diagnostics and error resolution

## Version

- Current: 1.0.3
- Status: Stable

## License

MIT

## Support

For issues and feature requests, visit the [GitHub repository](https://github.com/Chdezreyes76/claude-hexagonal-fsd-framework).

---

**Claude Hexagonal+FSD Framework** - Bringing enterprise-grade automation to your development workflow.
