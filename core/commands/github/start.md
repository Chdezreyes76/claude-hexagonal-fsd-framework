---
description: Iniciar trabajo en un issue (crear branch, asignar)
allowed-tools: Bash(gh issue:*), Bash(git checkout:*), Bash(git branch:*), Bash(git status:*)
---

# Iniciar Trabajo en Issue

El usuario quiere comenzar a trabajar en un issue. Argumentos: $ARGUMENTS

## Instrucciones

1. **Obtener numero de issue**:
   - El argumento debe ser el numero de issue (ej: `42`)
   - Si no se proporciona, listar issues asignados al usuario

2. **Obtener informacion del issue**:
   ```
   gh issue view <numero> --json title,labels,body,state
   ```

3. **Determinar tipo de branch**:
   - Buscar label `type: *` en el issue
   - Mapeo: feature->feat, bug->fix, refactor->refactor, docs->docs, test->test, chore->chore
   - Default: feat

4. **Crear nombre de branch**:
   - Formato: `<tipo>/<issue#>-<titulo-slugificado>`
   - Ejemplo: `feat/42-filtro-fecha-nominas`
   - Maximo 50 caracteres en el slug

5. **Verificar estado del repo**:
   ```
   git status
   ```
   - Si hay cambios sin commit, avisar al usuario

6. **Crear y cambiar a la branch**:
   ```
   git checkout -b <nombre-branch>
   ```

7. **Asignar el issue al usuario actual y moverlo a la columna "In Progress"**:
   ```
   gh issue edit <numero> --add-assignee @me
   gh project column list <project-id>
   gh project column move-issue <column-id> <numero>
   ```

8. **Actualizar labels del issue**:
   ```
   gh issue edit <numero> --remove-label "status: needs-triage" --remove-label "status: ready"
   ```

9. **Invocar al agente issue-analyzer**:
   - Usar Task tool con subagent_type="issue-analyzer"
   - Obtener clasificación: backend/frontend/fullstack
   
10. **Invocar al agente issue-planner**:
   - Usar Task tool con subagent_type="issue-planner"
   - El agente usará la clasificación del analyzer para mejor contexto
   - El agente propondrá plan de implementación

11. **Mostrar al usuario**:
    - Branch creada
    - Issue asignado
    - Clasificación del tipo (backend/frontend/fullstack)
    - Plan de implementacion propuesto
    - Recordar: commits deben incluir `#<issue>` en el mensaje

12. **Indicar próximos pasos** (CRÍTICO):
    - Explicar que hay DOS opciones para continuar
    - Opción 1: Implementación manual
    - Opción 2: Implementación automática con workflow

## Ejemplo de uso

```
/start 42
/start 15
```

## Próximos Pasos Después de `/start`

Una vez que el comando termina, tienes DOS opciones:

### Opción 1: Implementación Manual ✏️

Implementa los cambios manualmente siguiendo el plan:

```bash
# Realizar los cambios según el plan
# ...editar archivos, crear funciones, etc...

# Hacer commits con el formato correcto
git add .
git commit -m "feat(scope): descripción #42"
git commit -m "fix(scope): descripción #42"

# Al terminar:
/github:pr    # Crear Pull Request
```

**Ventajas:**
- Control total sobre la implementación
- Aprendes el código
- Perfecta para cambios complejos

**Desventajas:**
- Más tiempo
- Manual y propenso a errores
- Code review manual

---

### Opción 2: Implementación Automática (RECOMENDADO) 🤖

Delega toda la implementación al workflow automático:

```bash
/workflow:issue-complete
```

El workflow automático:
1. Invoca el implementer especializado basado en la clasificación:
   - Si es **backend** → `backend-implementer`
   - Si es **frontend** → `frontend-implementer`
   - Si es **fullstack** → `fullstack-implementer`

2. El implementer ejecuta:
   - Todos los cambios según el plan
   - Commits automáticos con convenciones
   - Manejo de reintentos (máx 3 intentos)

3. Continúa automáticamente:
   - Crea PR
   - Ejecuta code review
   - Mergea si pasa review
   - Siguiente issue (si es en modo loop)

**Ventajas:**
- Automatizado completamente
- Maneja reintentos si falla
- Code review automático
- Múltiples issues en loop

**Desventajas:**
- Menos control
- Más lento en issues simples

---

## Cómo Funciona la Selección del Implementer

El implementer se selecciona automáticamente basado en la **clasificación de `issue-analyzer`** (del paso 9):

```
Issue #42: "feat: crear API de usuarios"
  ↓
issue-analyzer clasifica como: backend (confidence: high)
  ↓
/workflow:issue-complete invoca: backend-implementer
  ↓
backend-implementer implementa siguiendo patrones hexagonales
```

```
Issue #43: "feat: agregar componente UserCard"
  ↓
issue-analyzer clasifica como: frontend (confidence: high)
  ↓
/workflow:issue-complete invoca: frontend-implementer
  ↓
frontend-implementer implementa siguiendo patrones FSD
```

```
Issue #44: "feat: crear CRUD de productos"
  ↓
issue-analyzer clasifica como: fullstack (confidence: high)
  ↓
/workflow:issue-complete invoca: fullstack-implementer
  ↓
fullstack-implementer coordina backend + frontend
```

---

## Comparación: Manual vs Automático

| Aspecto | Manual | Automático |
|--------|--------|-----------|
| **Tiempo** | Lento | Rápido |
| **Control** | Total | Delegado |
| **Reintentos** | Manual | Automático (3x) |
| **Code Review** | Manual | Automático |
| **Múltiples issues** | Uno a uno | Loop automático |
| **Ideal para** | Cambios complejos | Workflow productivo |

---

## Convencion de branches

| Tipo | Prefijo |
|------|---------|
| feature | feat/ |
| bug | fix/ |
| refactor | refactor/ |
| docs | docs/ |
| test | test/ |
| chore | chore/ |
| spike | spike/ |
