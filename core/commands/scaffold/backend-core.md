---
description: Generar infraestructura core del backend (database, logging, settings)
allowed-tools: Read, Write, Bash(mkdir:*), Bash(pip:*), Glob
---

# Backend Core Scaffolding

El usuario quiere generar la infraestructura core del backend. Argumentos: $ARGUMENTS

## Objetivo

Genera la infraestructura completa de `core/` con:
- Database connection (MySQL, PostgreSQL, SQLServer, SQLite)
- Logging system (JSON/Console, correlation IDs)
- Centralized settings (Pydantic + .env)

## Instrucciones

1. **Leer configuración del proyecto**:
   - Leer `.claude/claude.config.json` para obtener configuración del proyecto
   - Extraer: `project.name`, `project.version`, `stack.database.type`, `stack.database.port`, etc.

2. **Determinar el directorio backend**:
   - Leer `stack.backend.dirName` del config (por defecto: "backend")
   - Verificar que el directorio existe
   - Si no existe, crearlo con `mkdir -p backend`

3. **Crear estructura de directorios**:
   ```bash
   mkdir -p backend/core/database
   mkdir -p backend/core/logging
   ```

4. **Procesar templates y generar archivos**:
   - Leer templates desde `templates/backend/core/`
   - Reemplazar variables Mustache con valores del config
   - Escribir archivos en `backend/core/`

   Archivos a generar:
   - `backend/core/__init__.py`
   - `backend/core/settings.py`
   - `backend/core/database/__init__.py`
   - `backend/core/database/connection.py`
   - `backend/core/database/session.py`
   - `backend/core/logging/__init__.py`
   - `backend/core/logging/context.py`
   - `backend/core/logging/formatters.py`
   - `backend/core/logging/logger.py`
   - `backend/.env.example`

5. **Actualizar requirements.txt**:
   - Leer `backend/requirements.txt` (si existe)
   - Agregar dependencias desde `templates/backend/core/requirements-core.txt.tmpl`
   - No duplicar dependencias existentes
   - Si no existe requirements.txt, crearlo

6. **Mostrar resumen al usuario**:
   ```
   ✅ Backend core infrastructure created!

   Files created:
   - core/settings.py
   - core/database/ (3 files)
   - core/logging/ (4 files)
   - .env.example

   Dependencies added to requirements.txt:
   - pydantic-settings
   - python-dotenv
   - sqlalchemy
   - [database driver based on DB type]

   Next steps:
   1. Copy .env.example to .env: cp backend/.env.example backend/.env
   2. Update .env with your credentials
   3. Install dependencies: pip install -r backend/requirements.txt
   4. Initialize logging in main.py:
      from core.logging import setup_logging
      setup_logging()
   ```

## Variables de Template

Al procesar templates, usar estas variables del config:
- `{{projectName}}` - Nombre del proyecto
- `{{project.version}}` - Versión
- `{{project.description}}` - Descripción
- `{{projectNameKebab}}` - Nombre en kebab-case
- `{{stack.database.type}}` - Tipo de DB (mysql, postgresql, etc.)
- `{{stack.database.port}}` - Puerto de la DB
- `{{stack.database.user}}` - Usuario de la DB
- `{{stack.database.name}}` - Nombre de la DB
- `{{stack.frontend.port}}` - Puerto del frontend (para CORS)

## Condicionales para Templates

Según el tipo de base de datos, activar estos condicionales:
- `{{#if_mysql}}` - Si DB es MySQL
- `{{#if_postgresql}}` - Si DB es PostgreSQL
- `{{#if_sqlserver}}` - Si DB es SQL Server
- `{{#if_sqlite}}` - Si DB es SQLite

## Usage

```bash
/scaffold:backend-core
```

## What It Creates

This command scaffolds the complete `core/` infrastructure for your backend:

### 1. Configuration (`core/settings.py`)
- Centralized settings using Pydantic
- Environment variables loading from `.env`
- Multi-database support (MySQL, PostgreSQL, SQLServer, SQLite)
- Connection pool configuration
- Logging configuration
- API configuration

### 2. Database (`core/database/`)
- **`connection.py`**: Database engine setup with multi-DB support
  - MySQL (using pymysql)
  - PostgreSQL (using psycopg2)
  - SQLServer (using pyodbc)
  - SQLite (for development/testing)
- **`session.py`**: Session management with FastAPI dependency injection
- **`__init__.py`**: Package exports

### 3. Logging (`core/logging/`)
- **`context.py`**: Correlation IDs and request context tracking
- **`formatters.py`**: JSON and Console formatters with colors
- **`logger.py`**: Logger factory and setup
- **`__init__.py`**: Package exports

### 4. Environment Template (`.env.example`)
- Complete environment variables template
- Database-specific configuration
- Security settings
- API configuration

## Prerequisites

Before running this command:
1. Ensure you're in a project initialized with the framework
2. Backend directory should exist
3. Claude config should be present (`.claude/claude.config.json`)

## Steps Performed

1. **Read Configuration**: Load project configuration from `.claude/claude.config.json`
2. **Validate Structure**: Ensure backend directory exists
3. **Create Directories**: Create `core/`, `core/database/`, `core/logging/`
4. **Generate Files**: Process templates with project-specific values
5. **Update Dependencies**: Add required packages to `requirements.txt`
6. **Create .env.example**: Generate environment template

## Files Created

```
backend/
├── .env.example                 # Environment variables template
├── core/
│   ├── __init__.py              # Core package exports
│   ├── settings.py              # Centralized configuration
│   ├── database/
│   │   ├── __init__.py          # Database package exports
│   │   ├── connection.py        # Database engine and connection
│   │   └── session.py           # Session manager and dependency
│   └── logging/
│       ├── __init__.py          # Logging package exports
│       ├── context.py           # Context tracking (correlation IDs)
│       ├── formatters.py        # JSON and Console formatters
│       └── logger.py            # Logger factory
└── requirements.txt             # Updated with new dependencies
```

## Dependencies Added

The following packages will be added to `requirements.txt`:

### Core Dependencies
- `pydantic-settings>=2.0.0` - Settings management
- `python-dotenv>=1.0.0` - Environment variables loading
- `sqlalchemy>=2.0.0` - ORM and database toolkit

### Database Drivers (based on your DB type)
- **MySQL**: `pymysql>=1.1.0`
- **PostgreSQL**: `psycopg2-binary>=2.9.0`
- **SQLServer**: `pyodbc>=5.0.0`
- **SQLite**: (Built-in, no extra dependency)

## Database Support

### MySQL
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=myapp_db
```

Connection string: `mysql+pymysql://user:pass@host:port/dbname?charset=utf8mb4`

### PostgreSQL
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=myapp_db
```

Connection string: `postgresql+psycopg2://user:pass@host:port/dbname`

### SQL Server
```env
DB_TYPE=sqlserver
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=password
DB_NAME=myapp_db
```

Connection string: `mssql+pyodbc://user:pass@host:port/dbname?driver=ODBC+Driver+17+for+SQL+Server`

### SQLite
```env
DB_TYPE=sqlite
DB_SQLITE_PATH=./myapp.db
```

Connection string: `sqlite:///./myapp.db`

## Usage Examples

### Basic Usage
```bash
# Generate core infrastructure
/scaffold:backend-core
```

### After Generation

1. **Copy .env.example to .env**:
```bash
cp backend/.env.example backend/.env
```

2. **Update .env with your credentials**:
```bash
# Edit backend/.env
DB_USER=your_user
DB_PASSWORD=your_password
```

3. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

4. **Use in your code**:

```python
# In any module
from core import get_logger, settings, get_db
from sqlalchemy.orm import Session
from fastapi import Depends

logger = get_logger(__name__)

@app.get("/items")
def get_items(db: Session = Depends(get_db)):
    logger.info("Fetching items")
    return db.query(Item).all()
```

5. **Initialize logging in main.py**:
```python
from core.logging import setup_logging, disable_external_loggers

# At app startup
setup_logging(level="INFO", format_type="console")
disable_external_loggers()
```

## Logging Features

### Correlation IDs
Every log entry includes a unique correlation ID for request tracking:
```python
from core.logging import get_logger, set_correlation_id

logger = get_logger(__name__)
set_correlation_id("req-123")
logger.info("Processing request")  # Includes correlation_id
```

### Request Context
Track user, endpoint, and other request metadata:
```python
from core.logging import set_request_context, get_logger

logger = get_logger(__name__)
set_request_context({
    "user_id": "user_123",
    "endpoint": "/api/users",
    "method": "GET",
    "ip_address": "192.168.1.1"
})
logger.info("User action")  # Includes request context
```

### Multiple Formats
- **JSON** (production): Structured logs for parsing
- **Console** (development): Colored, human-readable
- **File** (optional): Rotating file handler

## Configuration Options

Edit `core/settings.py` or `.env` to customize:

```env
# Logging
LOG_LEVEL=INFO           # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT=console       # json or console
LOG_FILE=logs/app.log    # Optional file logging

# Database Pool
DB_POOL_SIZE=5           # Connection pool size
DB_MAX_OVERFLOW=10       # Max overflow connections
DB_POOL_TIMEOUT=30       # Pool timeout in seconds
DB_POOL_RECYCLE=3600     # Recycle connections after 1 hour
```

## Troubleshooting

### Database connection fails
1. Check `.env` file exists and has correct credentials
2. Verify database server is running
3. Check firewall/network access
4. Verify database driver is installed (`pip install pymysql` for MySQL)

### Import errors
1. Ensure you're in the backend directory
2. Check `requirements.txt` has all dependencies
3. Run `pip install -r requirements.txt`

### Logging not showing
1. Check `LOG_LEVEL` in `.env`
2. Verify `setup_logging()` is called in `main.py`
3. Use `get_logger(__name__)` instead of `logging.getLogger()`

## Integration with Hexagonal Architecture

The generated core works seamlessly with hexagonal architecture:

```
backend/
├── core/                        # Infrastructure (this scaffold)
│   ├── database/               # Database ports
│   ├── logging/                # Logging infrastructure
│   └── settings.py             # Configuration
├── domain/                      # Business logic
├── application/                 # Use cases
│   └── ports/                  # Interfaces
└── adapter/
    ├── inbound/                # API controllers
    │   └── api/
    │       └── dependencies/   # Use get_db() here
    └── outbound/               # Database repositories
        └── database/
            ├── models/         # Use Base from core
            └── repositories/   # Use Session from core
```

## Next Steps

After running this command:

1. Create `.env` from `.env.example`
2. Install dependencies: `pip install -r requirements.txt`
3. Initialize logging in `main.py`
4. Create your first database model using `Base`
5. Use `get_db()` in FastAPI dependencies
6. Use `get_logger(__name__)` in your modules

## Related Commands

- `/scaffold:new-domain` - Create new business domain
- `/scaffold:new-endpoint` - Add new API endpoint
- `/db:migrate` - Manage database migrations

---

**Generated with Claude Hexagonal+FSD Framework**
