---
description: Generar infraestructura Docker para desarrollo (containers, compose, scripts)
allowed-tools: Read, Write, Bash(mkdir:*), Bash(chmod:*), Glob
---

# Docker Development Environment Scaffolding

El usuario quiere generar la infraestructura completa de Docker para desarrollo. Argumentos: $ARGUMENTS

## Objetivo

Genera la infraestructura completa de Docker para desarrollo con:
- Dockerfiles para backend y frontend
- docker-compose.dev.yml con todos los servicios
- Scripts helper para start/stop
- Persistencia de código y datos
- Hot reload habilitado

## Instrucciones

1. **Leer configuración del proyecto**:
   - Leer `.claude/claude.config.json` para obtener configuración
   - Extraer: `stack.backend`, `stack.frontend`, `stack.database`
   - Determinar tipo de base de datos para generar servicio correcto

2. **Crear Dockerfiles**:
   - Generar `backend/Dockerfile.dev` desde template
   - Generar `frontend/Dockerfile.dev` desde template
   - Variables: Python version, Node version, puertos

3. **Crear .dockerignore files**:
   - Generar `backend/.dockerignore` desde template
   - Generar `frontend/.dockerignore` desde template
   - Excluir: venv/, node_modules/, .git/, logs, etc.

4. **Generar docker-compose.dev.yml**:
   - Leer template de docker-compose
   - Activar condicionales según tipo de base de datos:
     - `{{#if_mysql}}` - Si DB es MySQL
     - `{{#if_postgresql}}` - Si DB es PostgreSQL
     - `{{#if_sqlserver}}` - Si DB es SQL Server
     - `{{#if_sqlite}}` - Si DB es SQLite
     - `{{#if_not_sqlite}}` - Si DB NO es SQLite (para servicios de BD)
   - Configurar:
     - Network compartida
     - Volumes para persistencia
     - Health checks
     - Variables de entorno
   - Escribir en raíz del proyecto

5. **Crear scripts helper**:
   - Crear directorio `scripts/` si no existe
   - Generar `scripts/docker-start.sh` (Linux/Mac)
   - Generar `scripts/docker-start.bat` (Windows)
   - Generar `scripts/docker-stop.sh` (Linux/Mac)
   - Generar `scripts/docker-stop.bat` (Windows)
   - Hacer ejecutables los .sh: `chmod +x scripts/*.sh`

6. **Crear documentación**:
   - Generar `DOCKER-README.md` con instrucciones completas
   - Incluir: Quick start, comandos útiles, troubleshooting

7. **Actualizar .gitignore**:
   - Leer `.gitignore` actual (si existe)
   - Agregar sección Docker si no existe:
     ```
     # Docker
     docker-compose.override.yml
     .docker/
     *.log

     # Database volumes
     db-data/

     # Environment overrides
     .env.docker
     .env.local
     ```
   - No duplicar líneas existentes

8. **Mostrar resumen al usuario**:
   ```
   ✅ Docker development environment created!

   Files created:
   - backend/Dockerfile.dev
   - backend/.dockerignore
   - frontend/Dockerfile.dev
   - frontend/.dockerignore
   - docker-compose.dev.yml
   - scripts/docker-start.sh
   - scripts/docker-start.bat
   - scripts/docker-stop.sh
   - scripts/docker-stop.bat
   - DOCKER-README.md

   Services configured:
   - Backend (Python {{stack.backend.version}}, port {{stack.backend.port}})
   - Frontend (Node 18, port {{stack.frontend.port}})
   - Database ({{stack.database.type}}, port {{stack.database.port}})

   Next steps:
   1. Configure .env file: cp .env.example .env
   2. Start environment:
      Linux/Mac: ./scripts/docker-start.sh
      Windows: scripts\docker-start.bat
   3. Access:
      Frontend: http://localhost:{{stack.frontend.port}}
      Backend:  http://localhost:{{stack.backend.port}}
      API Docs: http://localhost:{{stack.backend.port}}/docs

   For more info, see DOCKER-README.md
   ```

## Variables de Template

Al procesar templates, usar estas variables del config:
- `{{projectName}}` - Nombre del proyecto
- `{{projectNameKebab}}` - Nombre en kebab-case
- `{{stack.backend.version}}` - Versión de Python
- `{{stack.backend.port}}` - Puerto del backend
- `{{stack.backend.dirName}}` - Directorio backend
- `{{stack.frontend.port}}` - Puerto del frontend
- `{{stack.frontend.dirName}}` - Directorio frontend
- `{{stack.database.type}}` - Tipo de DB (mysql, postgresql, sqlserver, sqlite)
- `{{stack.database.version}}` - Versión de la DB
- `{{stack.database.port}}` - Puerto de la DB
- `{{stack.database.name}}` - Nombre de la DB
- `{{stack.database.user}}` - Usuario de la DB

## Condicionales para docker-compose.yml

Según el tipo de base de datos, activar estos condicionales:
- `{{#if_mysql}}` - Si stack.database.type === "mysql"
- `{{#if_postgresql}}` - Si stack.database.type === "postgresql"
- `{{#if_sqlserver}}` - Si stack.database.type === "sqlserver"
- `{{#if_sqlite}}` - Si stack.database.type === "sqlite"
- `{{#if_not_sqlite}}` - Si stack.database.type !== "sqlite"

**Importante**: Para SQLite NO se genera servicio de base de datos en docker-compose.

## Archivos a Generar

```
project/
├── backend/
│   ├── Dockerfile.dev              ← Desde .claude/lib/templates/docker/backend.Dockerfile.dev.tmpl
│   └── .dockerignore               ← Desde .claude/lib/templates/docker/backend.dockerignore.tmpl
├── frontend/
│   ├── Dockerfile.dev              ← Desde .claude/lib/templates/docker/frontend.Dockerfile.dev.tmpl
│   └── .dockerignore               ← Desde .claude/lib/templates/docker/frontend.dockerignore.tmpl
├── docker-compose.dev.yml          ← Desde .claude/lib/templates/docker/docker-compose.dev.yml.tmpl
├── DOCKER-README.md                ← Desde .claude/lib/templates/docker/DOCKER-README.md.tmpl
├── scripts/
│   ├── docker-start.sh             ← Desde .claude/lib/templates/docker/scripts/docker-start.sh.tmpl
│   ├── docker-start.bat            ← Desde .claude/lib/templates/docker/scripts/docker-start.bat.tmpl
│   ├── docker-stop.sh              ← Desde .claude/lib/templates/docker/scripts/docker-stop.sh.tmpl
│   └── docker-stop.bat             ← Desde .claude/lib/templates/docker/scripts/docker-stop.bat.tmpl
└── .gitignore                      ← Actualizar (no sobrescribir)
```

## Validaciones

Antes de generar archivos:
1. Verificar que existan directorios `backend/` y `frontend/`
2. Verificar que exista `backend/requirements.txt`
3. Verificar que exista `frontend/package.json`
4. Si no existen, avisar al usuario y preguntar si continuar

## Características Implementadas

### Backend Container
- Python 3.11-slim base image
- Instala requirements.txt al iniciar
- Hot reload con uvicorn --reload
- Código mapeado con bind mount
- Dependencies en volume (venv/)

### Frontend Container
- Node 18-alpine base image
- Instala npm packages al iniciar
- HMR (Hot Module Replacement) habilitado
- Código mapeado con bind mount
- Dependencies en volume (node_modules/)

### Database Service (si no es SQLite)
- Imagen según tipo (MySQL 8.0, PostgreSQL 14, SQL Server 2019)
- Health checks configurados
- Datos persistentes en named volume
- Puerto expuesto para acceso desde host

### Networks & Volumes
- Network compartida entre servicios
- Named volumes para:
  - Database data
  - Backend venv
  - Frontend node_modules

## Troubleshooting

Si el usuario reporta problemas:

**Puerto en uso**:
- Verificar con `lsof -i :PORT` (Linux/Mac) o `netstat -ano | findstr :PORT` (Windows)
- Sugerir cambiar puerto en docker-compose.dev.yml

**Permisos**:
- Linux: `sudo chown -R $USER:$USER backend/ frontend/`
- Scripts no ejecutables: `chmod +x scripts/*.sh`

**Database no conecta**:
- Verificar que el servicio esté healthy: `docker-compose -f docker-compose.dev.yml ps`
- Revisar logs: `docker-compose -f docker-compose.dev.yml logs database`

**HMR no funciona**:
- Verificar que vite.config.ts tenga `server: { host: '0.0.0.0' }`
- Reiniciar container: `docker-compose -f docker-compose.dev.yml restart frontend`

## Notas Importantes

- Los Dockerfiles son para **desarrollo**, no producción
- El código se monta como volumen (cambios instantáneos)
- Las dependencias se instalan en volúmenes (mejor performance)
- Los datos de DB persisten en volumes (no se pierden al parar containers)
- Scripts helper funcionan en Linux/Mac/Windows
