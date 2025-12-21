---
description: Gestionar migraciones de base de datos con Alembic
allowed-tools: Read, Write, Edit, Bash(alembic:*), Bash(cd:*), Glob
---

# Gestionar Migraciones

El usuario quiere gestionar migraciones de base de datos. Argumentos: $ARGUMENTS

## Instrucciones

1. **Parsear argumentos**:
   - `create <mensaje>` - Crear nueva migracion
   - `up` o `upgrade` - Aplicar migraciones pendientes
   - `down` o `downgrade` - Revertir ultima migracion
   - `status` - Ver estado actual
   - `history` - Ver historial de migraciones

2. **Ejecutar desde directorio backend**:
   - Todos los comandos alembic deben ejecutarse desde `backend/`

## Subcomandos

### `/db/migrate create <mensaje>`

1. Ejecutar:
   ```bash
   cd backend && alembic revision --autogenerate -m "<mensaje>"
   ```

2. Leer el archivo generado en `backend/alembic/versions/`

3. **Revisar la migracion**:
   - Verificar que upgrade() tiene las operaciones correctas
   - Verificar que downgrade() revierte correctamente
   - Buscar problemas comunes:
     - Tablas/columnas que no deberian estar
     - Tipos de datos incorrectos
     - Indices faltantes
     - Foreign keys incorrectas

4. Mostrar al usuario:
   - Archivo creado
   - Resumen de cambios
   - Advertencias si las hay

### `/db/migrate up`

1. Ver estado actual:
   ```bash
   cd backend && alembic current
   ```

2. Aplicar migraciones:
   ```bash
   cd backend && alembic upgrade head
   ```

3. Verificar resultado:
   ```bash
   cd backend && alembic current
   ```

### `/db/migrate down`

1. Ver estado actual:
   ```bash
   cd backend && alembic current
   ```

2. Revertir:
   ```bash
   cd backend && alembic downgrade -1
   ```

3. Verificar resultado:
   ```bash
   cd backend && alembic current
   ```

### `/db/migrate status`

```bash
cd backend && alembic current
cd backend && alembic heads
```

### `/db/migrate history`

```bash
cd backend && alembic history --verbose
```

## Ejemplos de Uso

```bash
/db/migrate create "Create facturas table"
/db/migrate create "Add telefono to usuarios"
/db/migrate up
/db/migrate down
/db/migrate status
/db/migrate history
```

## Validaciones

Antes de crear migracion, verificar:

1. **Modelo SQLAlchemy existe** en `adapter/outbound/database/models/`
2. **Modelo importado** en alembic `env.py`
3. **Base de datos accesible**

## Convencion de Mensajes

| Accion | Formato | Ejemplo |
|--------|---------|---------|
| Crear tabla | `Create {tabla} table` | `Create facturas table` |
| Agregar columna | `Add {col} to {tabla}` | `Add telefono to usuarios` |
| Eliminar columna | `Remove {col} from {tabla}` | `Remove legacy from config` |
| Modificar | `Modify {col} in {tabla}` | `Modify email in usuarios` |
| Indice | `Add index on {tabla}.{col}` | `Add index on usuarios.email` |
| FK | `Add FK {tabla1} to {tabla2}` | `Add FK facturas to clientes` |

## Notas

- Siempre revisar migracion autogenerada antes de aplicar
- Probar downgrade localmente antes de commit
- No modificar migraciones ya aplicadas en otros entornos
