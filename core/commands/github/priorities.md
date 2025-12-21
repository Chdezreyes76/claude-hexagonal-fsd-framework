---
description: Analizar issues por prioridad y devolver los 3 más urgentes
allowed-tools: Bash(gh issue:*), Bash(gh project:*), Read, Grep
---

# Analizar Prioridades de Issues

El usuario quiere analizar los issues de un proyecto por prioridad. Argumentos: $ARGUMENTS

## Instrucciones

1. **Parsear argumentos**:
   - Si se proporciona un número, es el ID del proyecto GitHub
   - Si no se proporciona, usar el repositorio actual (todos los issues)
   - Ejemplo: `/priorities 42` o solo `/priorities`

2. **Listar issues del proyecto/repositorio**:
   ```bash
   # Si hay número de proyecto:
   gh project item-list <numero> --format json --limit 1000

   # Si no hay número (usar repo actual):
   gh issue list --state open --json number,title,labels,assignees,createdAt --limit 1000
   ```

3. **Clasificar issues por prioridad**:
   - Buscar labels `priority: critical`, `priority: high`, `priority: medium`, `priority: low`
   - Orden de urgencia:
     1. `priority: critical` - Bloquea producción
     2. `priority: high` - Resolver pronto
     3. `priority: medium` - Planificar en sprint
     4. `priority: low` - Cuando haya tiempo
     5. Sin label de prioridad - Considerar como low

4. **Criterios de desempate** (si hay múltiples issues con la misma prioridad):
   - Primero: Issues asignados al usuario actual
   - Segundo: Issues en estado `status: ready`
   - Tercero: Issues más antiguos (por fecha de creación)
   - Cuarto: Issues con label `status: blocked` van al final

5. **Analizar cada issue urgente**:
   Para cada uno de los 3 issues más urgentes, obtener:
   ```bash
   gh issue view <numero> --json number,title,labels,body,assignees,createdAt,updatedAt
   ```

6. **Generar reporte**:
   Presentar en formato de tabla markdown:
   ```
   ## Top 3 Issues Más Urgentes

   ### 1. #<numero> - <titulo>
   - **Prioridad**: critical/high/medium/low
   - **Tipo**: feature/bug/refactor/etc
   - **Estado**: ready/blocked/needs-info/etc
   - **Asignado a**: @usuario o "Sin asignar"
   - **Área**: backend/frontend/database/etc
   - **Creado**: hace X días
   - **Descripción**: [Resumen del body en 1-2 líneas]
   - **URL**: https://github.com/.../issues/<numero>

   ### 2. #<numero> - <titulo>
   ...

   ### 3. #<numero> - <titulo>
   ...
   ```

7. **Sugerencias al usuario**:
   - Si alguno está sin asignar, sugerir: `/start <issue#>` para comenzar
   - Si hay issues críticos, resaltar con emoji ⚠️
   - Si hay issues bloqueados, sugerir revisar dependencias
   - Mostrar estadísticas generales:
     - Total de issues abiertos
     - Distribución por prioridad (critical: X, high: Y, medium: Z, low: W)

## Ejemplo de uso

```bash
# Analizar todos los issues del repo actual
/priorities

# Analizar issues de un proyecto específico
/priorities 5

# Con nombre de proyecto
/priorities "{{projectName}} v1.3"
```

## Mapeo de Labels

### Prioridades (orden de urgencia)
1. `priority: critical` 🔴
2. `priority: high` 🟠
3. `priority: medium` 🟡
4. `priority: low` 🟢
5. Sin prioridad ⚪

### Estados importantes
- `status: blocked` - Resaltar como impedimento
- `status: ready` - Listo para trabajar
- `status: needs-triage` - Aún no clasificado
- `status: needs-info` - Requiere información adicional

## Notas

- El análisis debe ser rápido y conciso
- Si hay menos de 3 issues abiertos, mostrar todos los disponibles
- Si todos los issues tienen la misma prioridad, ordenar por fecha de creación
- Considerar solo issues en estado `open`
- Si se especifica un proyecto que no existe, mostrar error claro
