---
description: Crear un nuevo dominio completo (backend + frontend)
allowed-tools: Read, Write, Bash(mkdir:*), Glob
---

# Crear Nuevo Dominio

El usuario quiere crear un nuevo dominio. Argumentos: $ARGUMENTS

## Instrucciones

1. **Parsear argumentos**:
   - Formato: `<nombre_dominio>` (en snake_case)
   - Ejemplo: `facturacion`, `gastos_generales`, `criterios_reparto`

2. **Generar nombres derivados**:
   ```
   snake_case: facturacion
   PascalCase: Facturacion
   kebab-case: facturacion
   camelCase: facturacion
   plural: facturaciones (para rutas API)
   ```

3. **Leer templates** de `.claude/lib/templates/backend/` y `.claude/lib/templates/frontend/`

4. **Crear estructura Backend**:

   ```
   backend/
   ├── domain/entities/{dominio}.py
   ├── application/
   │   ├── dtos/{dominio}/
   │   │   ├── __init__.py
   │   │   ├── {dominio}_request_dto.py
   │   │   └── {dominio}_response_dto.py
   │   ├── ports/{dominio}/
   │   │   ├── __init__.py
   │   │   └── {dominio}_port.py
   │   └── use_cases/{dominio}/
   │       ├── __init__.py
   │       ├── crear_{dominio}_use_case.py
   │       └── listar_{dominio}_use_case.py
   └── adapter/
       ├── inbound/api/
       │   ├── routers/{dominio}_router.py
       │   └── dependencies/{dominio}/
       │       ├── __init__.py
       │       └── {dominio}_dependency.py
       └── outbound/database/
           ├── models/{dominio}_model.py
           └── repositories/{dominio}_repository.py
   ```

5. **Crear estructura Frontend**:

   ```
   frontend/src/
   ├── entities/{dominio}/
   │   └── model/
   │       └── types.ts
   ├── services/{dominio}.service.ts
   ├── hooks/use{Dominio}.ts
   └── pages/{Dominio}/
       └── {Dominio}Page.tsx
   ```

6. **Mostrar al usuario**:
   - Lista de archivos creados
   - Pasos siguientes:
     - Registrar router en `main.py`
     - Crear migracion: `alembic revision --autogenerate -m "Create {dominio} table"`
     - Ejecutar migracion: `alembic upgrade head`

## Contenido de los Archivos

Usar los templates en `.claude/lib/templates/` como base, reemplazando:
- `{{domain}}` -> nombre en snake_case
- `{{Domain}}` -> nombre en PascalCase
- `{{domains}}` -> nombre plural para rutas
- `{{DOMAIN}}` -> nombre en UPPER_CASE

## Ejemplo de Uso

```
/scaffold/new-domain facturacion
/scaffold/new-domain gastos_generales
/scaffold/new-domain criterios_reparto
```

## Notas

- El dominio se crea con operaciones CRUD basicas
- Los archivos __init__.py se crean vacios
- El router usa el prefijo `/api/v1/{domains}`
- Seguir patrones de arquitectura hexagonal del proyecto
