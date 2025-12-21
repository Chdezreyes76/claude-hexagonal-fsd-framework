# Configuration Reference

Complete reference for configuring the Claude Hexagonal+FSD Framework in your project.

## Configuration File: `claude.config.json`

The configuration file is located at `.claude/claude.config.json` and defines your project setup.

### Minimal Configuration

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

All other values will use defaults from `config/defaults.json`.

### Complete Configuration

```json
{
  "version": "1.0.0",
  "frameworkVersion": "1.0.0",

  "project": {
    "name": "Gextiona Dashboard",
    "nameSnake": "gextiona_dashboard",
    "nameKebab": "gextiona-dashboard",
    "description": "Cost management dashboard for payroll analysis",
    "version": "1.2.0"
  },

  "team": {
    "owner": {
      "name": "Carlos Hernandez",
      "email": "carlos@laorotava.org"
    },
    "github": {
      "owner": "Chdezreyes76",
      "repo": "GextionaDashboard",
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
      "name": "gextiona_dev",
      "port": 3307,
      "migrations": "alembic"
    }
  },

  "domains": {
    "examples": [
      "usuarios",
      "nominas",
      "centros-coste",
      "personal",
      "redistribucion"
    ],
    "namingConvention": {
      "entity": "PascalCase",
      "useCase": "{action}_{domain}_use_case.py",
      "repository": "{domain}_repository.py",
      "router": "{domain}_router.py"
    }
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

## Configuration Sections

### `project`

Project metadata and naming information.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | - | Project name (e.g., "My Dashboard") |
| `nameSnake` | string | No | Auto-generated | snake_case version of name |
| `nameKebab` | string | No | Auto-generated | kebab-case version of name |
| `description` | string | No | "" | Project description |
| `version` | string | No | "1.0.0" | Initial project version (semver) |

**Examples**:
```json
{
  "project": {
    "name": "E-Commerce Platform",
    "nameSnake": "ecommerce_platform",
    "nameKebab": "ecommerce-platform",
    "description": "Multi-vendor e-commerce marketplace",
    "version": "2.1.0"
  }
}
```

### `team`

Team and GitHub information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner.name` | string | No | Developer/team name |
| `owner.email` | string | Yes | Email for QA reports and notifications |
| `github.owner` | string | No | GitHub username or organization |
| `github.repo` | string | No | GitHub repository name |
| `github.mainBranch` | string | No | Main branch name (default: "main") |

**Examples**:
```json
{
  "team": {
    "owner": {
      "name": "Development Team",
      "email": "dev@company.com"
    },
    "github": {
      "owner": "mycompany",
      "repo": "product-api",
      "mainBranch": "main"
    }
  }
}
```

### `stack`

Technology stack configuration.

#### Backend

| Field | Type | Allowed Values | Default | Description |
|-------|------|---|---|---|
| `language` | string | "python" | "python" | Backend language |
| `version` | string | "3.11"+ | "3.11" | Python version |
| `framework` | string | "fastapi" | "fastapi" | Web framework |
| `architecture` | string | "hexagonal" | "hexagonal" | Architecture pattern |
| `dirName` | string | any | "backend" | Backend directory name |
| `port` | integer | 1-65535 | 8000 | Development server port |

#### Frontend

| Field | Type | Allowed Values | Default | Description |
|-------|------|---|---|---|
| `language` | string | "typescript" | "typescript" | Frontend language |
| `framework` | string | "react" | "react" | UI framework |
| `version` | string | "19" | "19" | React version |
| `architecture` | string | "feature-sliced-design" | "feature-sliced-design" | Architecture pattern |
| `dirName` | string | any | "frontend" | Frontend directory name |
| `port` | integer | 1-65535 | 3000 | Development server port |

#### Database

| Field | Type | Allowed Values | Default | Description |
|-------|------|---|---|---|
| `type` | string | "mysql", "postgresql" | "mysql" | Database system |
| `version` | string | e.g. "8.0", "15" | "8.0" | Database version |
| `name` | string | any | "{projectSnake}_dev" | Database name |
| `port` | integer | 1-65535 | 3306 | Database server port |
| `migrations` | string | "alembic" | "alembic" | Migration tool |

**Examples**:
```json
{
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
      "type": "postgresql",
      "version": "15",
      "name": "myapp_dev",
      "port": 5432,
      "migrations": "alembic"
    }
  }
}
```

### `domains`

Business domain configuration.

| Field | Type | Description |
|-------|------|-------------|
| `examples` | array | List of example business domains (e.g., "usuarios", "productos") |
| `namingConvention.entity` | string | Entity naming pattern (typically "PascalCase") |
| `namingConvention.useCase` | string | Use case file pattern |
| `namingConvention.repository` | string | Repository file pattern |
| `namingConvention.router` | string | Router file pattern |

**Examples**:
```json
{
  "domains": {
    "examples": [
      "usuarios",
      "productos",
      "ordenes",
      "pagos"
    ],
    "namingConvention": {
      "entity": "PascalCase",
      "useCase": "{action}_{domain}_use_case.py",
      "repository": "{domain}_repository.py",
      "router": "{domain}_router.py"
    }
  }
}
```

### `paths`

Directory path configuration. Allows customization of backend/frontend directories if needed.

**Examples**:
```json
{
  "paths": {
    "backend": {
      "root": "./services/api",
      "domain": "./services/api/domain",
      "application": "./services/api/application",
      "adapter": "./services/api/adapter"
    },
    "frontend": {
      "root": "./apps/web",
      "src": "./apps/web/src"
    }
  }
}
```

### `qa`

Quality Assurance automation configuration.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | true | Enable QA automation |
| `emailReports` | boolean | false | Send QA reports via email |
| `localReportPath` | string | "./.claude/qa-reports" | Path to store local reports |

**Examples**:
```json
{
  "qa": {
    "enabled": true,
    "emailReports": false,
    "localReportPath": "./.claude/qa-reports"
  }
}
```

### `workflows`

Automation workflow configuration.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoImplement` | boolean | true | Auto-implement issues |
| `autoReview` | boolean | true | Auto-review code changes |
| `autoMerge` | boolean | false | Auto-merge PRs |
| `requireTests` | boolean | false | Require passing tests before merge |

**Examples**:
```json
{
  "workflows": {
    "autoImplement": true,
    "autoReview": true,
    "autoMerge": false,
    "requireTests": true
  }
}
```

## Configuration Examples

### Minimal SaaS Project

```json
{
  "version": "1.0.0",
  "project": {
    "name": "SaaS Platform"
  },
  "team": {
    "owner": {
      "email": "team@example.com"
    }
  }
}
```

### Large Enterprise Project

```json
{
  "version": "1.0.0",
  "project": {
    "name": "Enterprise Portal",
    "nameSnake": "enterprise_portal",
    "nameKebab": "enterprise-portal",
    "description": "Internal company portal with multiple modules",
    "version": "3.2.1"
  },
  "team": {
    "owner": {
      "name": "Engineering Team",
      "email": "engineering@company.com"
    },
    "github": {
      "owner": "company-tech",
      "repo": "enterprise-portal",
      "mainBranch": "develop"
    }
  },
  "stack": {
    "backend": {
      "language": "python",
      "version": "3.11",
      "framework": "fastapi",
      "architecture": "hexagonal",
      "dirName": "services/api",
      "port": 8000
    },
    "frontend": {
      "language": "typescript",
      "framework": "react",
      "version": "19",
      "architecture": "feature-sliced-design",
      "dirName": "apps/web",
      "port": 3000
    },
    "database": {
      "type": "postgresql",
      "version": "15",
      "name": "enterprise_portal_prod",
      "port": 5432,
      "migrations": "alembic"
    }
  },
  "domains": {
    "examples": [
      "auth",
      "users",
      "departments",
      "projects",
      "reports",
      "notifications"
    ]
  },
  "qa": {
    "enabled": true,
    "emailReports": true,
    "localReportPath": "./.claude/qa-reports"
  },
  "workflows": {
    "autoImplement": true,
    "autoReview": true,
    "autoMerge": false,
    "requireTests": true
  }
}
```

## Updating Configuration

To update configuration after initialization:

1. Edit `.claude/claude.config.json` directly
2. Save the file
3. Changes apply immediately

To regenerate from wizard:

```bash
cd .claude-framework/cli
node index.js init --config-only /path/to/project
```

## Validation

Validate your configuration:

```bash
cd .claude-framework/cli
node index.js validate /path/to/project
```

Configuration errors will be reported with details on how to fix them.

## Environment Variables

The framework respects environment variables for sensitive values:

- `GITHUB_TOKEN`: GitHub personal access token (for gh commands)
- `DATABASE_URL`: Override database connection string (if needed)

These can be set in `.env` or `.claude/settings.local.json` (which is git-ignored).

---

For more details, see [Getting Started](./getting-started.md) or [CLI Reference](./cli-reference.md).
