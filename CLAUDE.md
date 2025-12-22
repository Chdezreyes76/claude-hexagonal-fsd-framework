# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the **Claude Hexagonal+FSD Framework** - a comprehensive development automation framework for building full-stack applications. The framework itself is not an application but rather a tool that gets initialized into other projects to provide structure, skills, commands, and automated workflows.

## Repository Structure

```
claude-hexagonal-fsd-framework/
├── cli/                      # CLI tool for initializing framework in projects
│   ├── lib/                  # Core CLI modules (utils, validator, config-generator, etc.)
│   ├── index.js              # CLI entry point
│   └── package.json          # CLI dependencies (inquirer, chalk, ora, mustache, ajv)
├── core/                     # Framework components copied to target projects
│   ├── skills/               # 11 specialized skills for Claude Code
│   ├── commands/             # 20+ slash commands organized by category
│   ├── agents/               # 3 specialized agents (planner, reviewer, debugger)
│   └── settings.json.tmpl    # Claude Code permissions template
├── templates/                # Mustache templates for code generation
│   ├── backend/              # FastAPI hexagonal architecture templates
│   ├── frontend/             # React FSD templates
│   ├── docker/               # Docker development environment templates
│   └── issues/               # GitHub issue templates
├── config/                   # Default configuration and JSON schema
└── docs/                     # Framework documentation
```

## Key Concepts

### 1. Framework Distribution Model

This repository does NOT get modified by users. Instead:
- Users run `cli/index.js init /path/to/their/project`
- The CLI wizard collects project configuration
- Framework files are **copied** from `core/` to `{project}/.claude/`
- Templates from `templates/` are processed with Mustache and copied to the target project
- Users work in their own project with the framework installed in `.claude/`

### 2. Template Processing

All files in `core/` and `templates/` can contain Mustache variables:
- `{{projectName}}` → User's project name
- `{{projectNameSnake}}` → snake_case variant
- `{{backendPort}}` → Backend port (default: 8000)
- `{{databaseType}}` → mysql, postgresql, sqlserver, or sqlite

Variables are defined in `cli/lib/config-generator.js` via `generateTemplateVariables()`.

### 3. Architecture Patterns

The framework enforces two architectural patterns:

**Backend - Hexagonal Architecture (Ports & Adapters)**
```
backend/
├── domain/entities/           # Pure business entities
├── application/
│   ├── use_cases/            # Business operations (1 file per use case)
│   ├── ports/                # Interfaces/contracts
│   └── dtos/                 # Data Transfer Objects
├── adapter/
│   ├── inbound/api/          # FastAPI routers, dependencies
│   └── outbound/database/    # SQLAlchemy models, repositories
└── core/                     # Infrastructure (config, logging)
```

**Frontend - Feature-Sliced Design (FSD)**
```
frontend/src/
├── components/    # Shared UI (Button, Card)
├── entities/      # Business entities with types & API
├── features/      # Feature-specific logic & components
├── widgets/       # Complex composed components
├── pages/         # Application pages
├── services/      # API clients
└── hooks/         # Shared hooks (TanStack Query)
```

## Development Commands

### CLI Development

```bash
# Install CLI dependencies
cd cli
npm install

# Test initialization wizard
node index.js init ../test-project

# Test with verbose output
node index.js init ../test-project --verbose

# Run validation (coming soon)
node index.js validate ../test-project
```

### Framework Development

When modifying framework components:

1. **Modifying Skills**: Edit files in `core/skills/{skill-name}/`
   - Each skill has `skill.md` (main content) and optional supporting files
   - Skills use frontmatter for metadata (name, description, allowed-tools)

2. **Modifying Commands**: Edit files in `core/commands/{category}/`
   - Commands are markdown files with instructions for Claude Code
   - Organized by category: github/, scaffold/, quality/, db/, workflow/, qa/

3. **Modifying Templates**: Edit files in `templates/`
   - Use `.tmpl` extension for files with Mustache variables
   - Test variable replacement by running init wizard

4. **Testing Changes**: Always test by running the init wizard on a dummy project
   ```bash
   mkdir ../test-project
   node cli/index.js init ../test-project
   cd ../test-project
   # Verify .claude/ directory and files
   ```

## Configuration System

### Schema Validation

- Schema defined in `config/schema.json` (AJV JSON Schema)
- Defaults in `config/defaults.json`
- Validation in `cli/lib/validator.js`:
  - `validateConfig()` - Schema validation
  - `validateBusinessRules()` - Custom rules (unique ports, email format, snake_case DB names)

### Configuration File Structure

Generated `claude.config.json` in target projects:
```json
{
  "version": "1.0.0",
  "frameworkVersion": "1.3.0",
  "project": { "name", "nameSnake", "nameKebab", "version" },
  "team": { "owner": { "name", "email" }, "github": { "owner", "repo", "mainBranch" } },
  "stack": { "backend", "frontend", "database" },
  "domains": { "examples": ["users", "products"] },
  "paths": { "backend", "frontend" },
  "qa": { "enabled", "emailReports", "localReportPath" },
  "workflows": { "autoImplement", "autoReview", "autoMerge", "requireTests" }
}
```

## Skills System

Skills are knowledge bases for Claude Code. Key skills:

- **hexagonal-architecture**: Backend patterns, naming conventions, data flow
- **feature-sliced-design**: Frontend FSD patterns, dependency rules, React 19 + TanStack Query
- **backend-implementer**: Autonomous agent that implements backend issues
- **frontend-implementer**: Autonomous agent that implements frontend issues
- **fullstack-implementer**: Coordinates backend + frontend implementation
- **issue-analyzer**: Semantically detects if issue is backend/frontend/fullstack
- **test-runner**: Validates tests before commits
- **qa-review-done**: Automated QA reviews for issues in "Done" status
- **github-workflow**: GitHub conventions (branches, commits, PRs)
- **alembic-migrations**: Database migration patterns with Alembic
- **issue-workflow**: Complete issue orchestration with autonomous mode (auto-select → auto-implement → auto-correct reviews → auto-resolve conflicts → auto-merge)

## Commands System

Commands are slash commands for Claude Code. Key categories:

**GitHub Integration** (`/github:*`)
- `/github:issue` - Create GitHub issue
- `/github:start` - Start work on issue (create branch, assign)
- `/github:pr` - Create Pull Request
- `/github:merge` - Merge PR and cleanup branches (with auto-resolve conflicts)
- `/github:next` - Analyze priorities and start next issue
- `/github:priorities` - Analyze and return top 3 priority issues
- `/github:epic-breakdown` - Convert complex issue into Epic with sub-issues

**Scaffolding** (`/scaffold:*`)
- `/scaffold:new-domain` - Create complete domain (backend + frontend)
- `/scaffold:new-endpoint` - Add endpoint to existing domain
- `/scaffold:backend-core` - Generate complete backend structure
- `/scaffold:docker-dev` - Generate Docker development environment

**Quality Assurance** (`/quality:*`, `/qa:*`)
- `/quality:review` - Review code against architecture patterns
- `/qa:review-done` - Review all issues in "Done" status

**Database** (`/db:*`)
- `/db:migrate` - Manage Alembic migrations (create, apply, rollback)

**Workflow** (`/workflow:*`)
- `/workflow:issue-complete` - Full issue lifecycle with autonomous mode (--autonomous flag enables zero-intervention workflow)

## Autonomous Workflow Capabilities (v1.3.0)

The framework includes advanced autonomous workflow features that enable zero-intervention issue resolution:

### Key Features

**Phase 1-3: Auto-Selection and Classification** (v1.2.0)
- Auto-selects highest priority issue from project board
- Deep file analysis for 90%+ classification accuracy (backend/frontend/fullstack)
- Epic breakdown for complex issues (converts to GitHub Project with manageable sub-issues)

**Phase 4: Auto-Correction of Code Reviews** (v1.3.0)
- Parses structured JSON feedback from code-reviewer
- Automatically re-implements with corrections
- Up to N cycles (default: 2) before failing
- 50%+ of review rejections fixed automatically

**Phase 5: Auto-Resolution of Git Conflicts** (v1.3.0)
- Three progressive strategies:
  1. Rebase (preferred - clean history)
  2. Merge with 'ours' (conservative)
  3. Selective (auto-resolves config files only: package.json, requirements.txt)
- 67% of conflicts resolved automatically
- 100% of dependency file conflicts resolved

**Phase 6: Session Persistence and Circuit Breakers** (v1.3.0)
- Saves progress after every issue to `.claude/session/workflow-session.json`
- Resume anytime with `--resume=path`
- Timeout protection: 10 min limit per issue (configurable)
- Circuit breaker: stops after 3 consecutive failures for diagnosis
- Adjustable parameters on resume

**Phase 7: --autonomous Alias** (v1.3.0)
- Single flag that enables ALL autonomous capabilities
- Optimal default configuration
- Individual parameter overrides supported
- Shows configuration summary on startup

### Usage Example

```bash
# Fully autonomous mode - processes up to 20 issues with zero intervention
/workflow:issue-complete --loop --max=20 --project=7 --autonomous

# What --autonomous enables:
# - Auto-select (picks highest priority issue)
# - Auto-classify (analyze-files strategy)
# - Auto-fix-reviews=2 (up to 2 correction cycles)
# - Auto-resolve-conflicts (3 progressive strategies)
# - Epic-breakdown-on-failure (converts complex issues to Epics)
# - Save-session (auto-saves progress)
# - Timeout-per-issue=10 (minutes)
# - Max-consecutive-failures=3 (circuit breaker)
```

### Expected Results

Typical autonomous session (20 issues):
- ✅ 16 completed (80%) - fully merged PRs
- 🎯 2 converted to Epics (10%) - complex issues broken down
- ⚠️ 2 skipped (10%) - conflicts or failures after retries
- 🎉 ZERO manual interventions required
- ⏱️ 85% time savings vs manual mode

## Naming Conventions

### Backend (Python)

| Component | Pattern | Example |
|-----------|---------|---------|
| Entity | PascalCase | `Usuario`, `Departamento` |
| Use Case | `{action}_{domain}_use_case.py` | `crear_usuario_use_case.py` |
| Port | `{domain}_port.py` | `usuario_port.py` |
| Repository | `{domain}_repository.py` | `usuario_repository.py` |
| Model | `{domain}_model.py` | `usuario_model.py` |
| Router | `{domain}_router.py` | `usuario_router.py` |
| DTO | `{domain}_request_dto.py` | `usuario_request_dto.py` |

### Frontend (TypeScript/React)

| Component | Pattern | Example |
|-----------|---------|---------|
| Component | PascalCase | `UserCard.tsx` |
| Hook | `use{Name}` | `useUsuarios.ts` |
| Service | `{domain}.service.ts` | `usuarios.service.ts` |
| Page | `{Name}Page.tsx` | `UsuariosPage.tsx` |
| Types | `types.ts` or `{domain}.types.ts` | `types.ts` |

## Important Implementation Rules

### When Modifying Framework Code

1. **Never break the CLI wizard**: Changes to `cli/lib/` modules must maintain backward compatibility
2. **Test template variables**: New variables must be added to `generateTemplateVariables()` in `config-generator.js`
3. **Update schema**: Changes to config structure require updates to `config/schema.json`
4. **Document changes**: Update `CHANGELOG.md` following Keep a Changelog format
5. **Validate before commit**: Run init wizard on test project to verify all changes work

### When Adding New Skills

1. Create directory in `core/skills/{skill-name}/`
2. Add `skill.md` with frontmatter:
   ```markdown
   ---
   name: skill-name
   description: Brief description
   allowed-tools: Read, Glob, Grep, Write, Edit
   ---
   ```
3. Add supporting files (examples, patterns) in same directory
4. Update README.md to document the new skill

### When Adding New Commands

1. Create markdown file in `core/commands/{category}/{command-name}.md`
2. Use clear instructions for Claude Code
3. Include examples of usage
4. Update README.md to list the new command

### When Adding New Templates

1. Add template file in `templates/{category}/` with `.tmpl` extension
2. Use Mustache syntax for variables: `{{variableName}}`
3. Add corresponding command in `core/commands/scaffold/` if it's a scaffold template
4. Test template processing with init wizard

## Technology Stack

**CLI Tool**
- Node.js 18+
- inquirer (interactive prompts)
- chalk (terminal colors)
- ora (spinners)
- mustache (template processing)
- ajv + ajv-formats (JSON Schema validation)
- fs-extra (file operations)

**Target Projects (after initialization)**
- Backend: Python 3.11, FastAPI, SQLAlchemy, Alembic
- Frontend: React 19, TypeScript, TanStack Query, TailwindCSS v4, Vite
- Database: MySQL 8.0 / PostgreSQL 14 / SQL Server 2019 / SQLite
- Development: Docker Compose (optional)

## Testing Strategy

Since this is a framework generator, testing involves:

1. **Integration testing**: Run init wizard on fresh directory
2. **Template validation**: Verify all Mustache variables are replaced
3. **Schema validation**: Ensure generated config passes schema validation
4. **File structure**: Verify `.claude/` directory structure is correct
5. **Permissions**: Check `settings.json` has correct permissions

Example test workflow:
```bash
# Create test project
mkdir test-project && cd test-project
git init

# Run init wizard
node ../claude-hexagonal-fsd-framework/cli/index.js init

# Verify structure
ls -la .claude/
cat .claude/claude.config.json | python -m json.tool
cat .claude/settings.json | python -m json.tool

# Verify templates processed
grep -r "{{" .claude/  # Should return nothing

# Clean up
cd .. && rm -rf test-project
```

## Permissions System

The framework uses Claude Code's permissions system via `settings.json`:
- Bash commands are whitelisted (git, docker, alembic, pytest, npm, etc.)
- Skills are explicitly allowed
- MCP tools can be added as needed

When adding new Bash commands to skills/commands, update `core/settings.json.tmpl`.

## Version Management

- Framework version in `cli/package.json` (currently 1.3.0)
- Target project version set during init wizard
- Version compatibility tracked in generated `claude.config.json`
- Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- v1.3.0 introduced autonomous workflow capabilities (zero-intervention mode)

## Common Pitfalls

1. **Forgetting to process templates**: All `.tmpl` files must be processed with Mustache before copying
2. **Hardcoding values**: Use variables for project-specific values (ports, names, paths)
3. **Breaking schema**: Changes to config structure must update both schema and validator
4. **Missing permissions**: New Bash commands in skills need whitelisting in settings.json.tmpl
5. **Path separators**: Use Node.js `path` module for cross-platform compatibility (Windows vs Linux)

## Contributing Guidelines

When making changes to this framework:

1. Test on clean project directory
2. Verify Windows and Linux compatibility (use `path.join()`, not hardcoded `/` or `\`)
3. Update CHANGELOG.md with changes
4. Increment version in `cli/package.json` following semver
5. Test all affected commands/skills with init wizard
6. Ensure generated files have no unprocessed `{{variables}}`
