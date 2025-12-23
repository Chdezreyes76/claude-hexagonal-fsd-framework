---
name: alembic-migrations
description: Patrones de migraciones de base de datos con Alembic. Usar cuando se creen o modifiquen tablas, se generen migraciones o se resuelvan conflictos de migracion.
allowed-tools: Read, Write, Edit, Bash(alembic:*), Glob, Grep
---

# Alembic Migrations - {{projectName}}

Este skill define los patrones para gestionar migraciones de base de datos con Alembic.

## Estructura

```
backend/
├── alembic/
│   ├── versions/          # Archivos de migracion
│   │   └── YYYY_MM_DD_HHMM_descripcion.py
│   ├── env.py             # Configuracion de Alembic
│   └── script.py.mako     # Template para migraciones
└── alembic.ini            # Configuracion principal
```

## Comandos Basicos

```bash
# Ver estado actual
alembic current

# Ver historial
alembic history

# Crear migracion automatica
alembic revision --autogenerate -m "descripcion"

# Crear migracion manual
alembic revision -m "descripcion"

# Aplicar migraciones pendientes
alembic upgrade head

# Aplicar hasta una revision especifica
alembic upgrade <revision>

# Revertir ultima migracion
alembic downgrade -1

# Revertir a revision especifica
alembic downgrade <revision>

# Ver SQL sin ejecutar
alembic upgrade head --sql
```

## Convenciones de Nombres

### Archivo de Migracion
```
YYYY_MM_DD_HHMM_descripcion_corta.py

Ejemplos:
2024_01_15_1030_create_usuarios_table.py
2024_01_16_0900_add_email_to_usuarios.py
2024_01_17_1400_create_nominas_tables.py
```

### Mensaje de Migracion
```
# Crear tabla
"Create {tabla} table"

# Agregar columna
"Add {columna} to {tabla}"

# Eliminar columna
"Remove {columna} from {tabla}"

# Modificar columna
"Modify {columna} in {tabla}"

# Crear indice
"Add index on {tabla}.{columna}"

# Crear foreign key
"Add FK from {tabla1} to {tabla2}"
```

## Estructura de Migracion

```python
"""Create usuarios table

Revision ID: abc123
Revises: def456
Create Date: 2024-01-15 10:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'abc123'
down_revision = 'def456'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('activo', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_usuarios_email', 'usuarios', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_usuarios_email', 'usuarios')
    op.drop_table('usuarios')
```

## Operaciones Comunes

### Crear Tabla
```python
def upgrade() -> None:
    op.create_table(
        'nombre_tabla',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

def downgrade() -> None:
    op.drop_table('nombre_tabla')
```

### Agregar Columna
```python
def upgrade() -> None:
    op.add_column('tabla', sa.Column('nueva_columna', sa.String(100)))

def downgrade() -> None:
    op.drop_column('tabla', 'nueva_columna')
```

### Modificar Columna
```python
def upgrade() -> None:
    op.alter_column('tabla', 'columna',
        existing_type=sa.String(100),
        type_=sa.String(255),
        existing_nullable=True,
        nullable=False
    )

def downgrade() -> None:
    op.alter_column('tabla', 'columna',
        existing_type=sa.String(255),
        type_=sa.String(100),
        existing_nullable=False,
        nullable=True
    )
```

### Crear Indice
```python
def upgrade() -> None:
    op.create_index('ix_tabla_columna', 'tabla', ['columna'])

def downgrade() -> None:
    op.drop_index('ix_tabla_columna', 'tabla')
```

### Foreign Key
```python
def upgrade() -> None:
    op.add_column('hijos', sa.Column('padre_id', sa.Integer()))
    op.create_foreign_key(
        'fk_hijos_padre',
        'hijos', 'padres',
        ['padre_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade() -> None:
    op.drop_constraint('fk_hijos_padre', 'hijos', type_='foreignkey')
    op.drop_column('hijos', 'padre_id')
```

## Buenas Practicas

1. **Siempre revisar migracion autogenerada** antes de aplicar
2. **Probar downgrade** para asegurar reversibilidad
3. **No modificar migraciones ya aplicadas** en produccion
4. **Usar transacciones** para operaciones criticas
5. **Backup antes de migrar** en produccion

## Resolucion de Conflictos

Si hay conflicto de heads:

```bash
# Ver heads actuales
alembic heads

# Merge de heads
alembic merge -m "merge heads" <rev1> <rev2>

# O rebasar manualmente editando down_revision
```

## Prefijos de Tablas por Dominio

| Dominio | Prefijo | Ejemplo |
|---------|---------|---------|
| Auth/Usuarios | `auth_` | `auth_usuarios` |
| Centros Coste | `cc_` | `cc_departamentos` |
| Personal | `personal_` | `personal_empleados` |
| Nominas | `nominas_` | `nominas_conceptos` |
| Redistribucion | `redistribucion_` | `redistribucion_criterios` |
| Contabilidad | `cont_` | `cont_asientos` |

## Troubleshooting

### Error: "Target database is not up to date"
```bash
alembic upgrade head
```

### Error: "Can't locate revision"
```bash
alembic history
alembic stamp head  # Solo si BD esta correcta
```

### Error: "Multiple heads"
```bash
alembic merge -m "merge" head1 head2
```
