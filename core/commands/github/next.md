---
description: Analizar issues prioritarios e iniciar trabajo automáticamente
allowed-tools: Bash(gh issue:*), Bash(gh project:*), Bash(git:*), AskUserQuestion, Task
---

# Workflow Automático: Next Issue

Analiza los issues más urgentes e inicia trabajo en uno automáticamente. Combina `/priorities` + `/start` en un solo comando.

## Flujo Completo

### PASO 1: Analizar Prioridades

#### Sin filtro de proyecto (comportamiento por defecto)

1. **Listar issues abiertos**:
   ```bash
   gh issue list --state open --json number,title,labels,assignees,createdAt --limit 1000
   ```

2. **Clasificar por prioridad**:
   - Orden: critical → high → medium → low → sin label
   - Criterios de desempate:
     1. Issues sin asignar (disponibles)
     2. Issues con `status: ready`
     3. Issues más antiguos
     4. Excluir issues con `status: blocked`

3. **Obtener top 5 más urgentes**:
   Para cada issue, obtener detalles completos:
   ```bash
   gh issue view <numero> --json number,title,labels,body,assignees,createdAt
   ```

#### Con filtro de proyecto (`--project=N` en argumentos)

Si se detecta `--project=N` en los argumentos:

1. **Obtener issues del proyecto**:
   ```bash
   gh project item-list N --owner {{githubOwner}} --format json --limit 1000
   ```

2. **Filtrar y extraer números de issues**:
   - Parsear JSON resultante
   - Extraer campo `content.number` (ignorar si no existe, puede ser PR)
   - Verificar que `content.type` sea "Issue" (no "PullRequest")
   - Filtrar solo issues con estado "OPEN"

3. **Para cada issue del proyecto, obtener detalles**:
   ```bash
   gh issue view <numero> --json number,title,labels,body,assignees,createdAt,state
   ```

4. **Clasificar por prioridad** (mismo criterio que sin filtro):
   - Orden: critical → high → medium → low → sin label
   - Criterios de desempate iguales
   - Excluir `status: blocked`

5. **Obtener top 5 más urgentes del proyecto**

### PASO 2: Presentar Opciones al Usuario

Mostrar los 5 issues más urgentes en formato compacto:

```
🎯 Top 5 Issues Más Urgentes

1️⃣  #42 [ALTA] feat(nominas): añadir filtro por fecha
    📅 Creado hace 5 días | 👤 Sin asignar | 🏷️ area: frontend

2️⃣  #38 [MEDIA] fix(auth): corregir callback OAuth
    📅 Creado hace 3 días | 👤 @usuario | 🏷️ area: backend

3️⃣  #25 [MEDIA] refactor(lib): centralizar validaciones
    📅 Creado hace 2 días | 👤 Sin asignar | 🏷️ area: backend

4️⃣  #18 [MEDIA] feat(dashboard): agregar gráfico temporal
    📅 Creado hace 1 día | 👤 Sin asignar | 🏷️ area: frontend

5️⃣  #12 [LOW] docs: actualizar README con ejemplos
    📅 Creado hace 10 días | 👤 Sin asignar | 🏷️ area: docs
```

### PASO 3: Preguntar al Usuario

**Usar AskUserQuestion** con las siguientes opciones:
- **Pregunta**: "¿En qué issue quieres trabajar?"
- **Header**: "Seleccionar Issue"
- **multiSelect**: false
- **Opciones** (máximo 4, mostrar los 4 más prioritarios):
  1. `label: "#42 - filtro por fecha"` | `description: "Prioridad ALTA - Sin asignar"`
  2. `label: "#38 - callback OAuth"` | `description: "Prioridad MEDIA - Ya asignado a @usuario"`
  3. `label: "#25 - centralizar validaciones"` | `description: "Prioridad MEDIA - Sin asignar"`
  4. `label: "#18 - gráfico temporal"` | `description: "Prioridad MEDIA - Sin asignar"`

**IMPORTANTE**:
- Si el issue #1 está sin asignar, marcarlo como "(Recomendado)" en el label
- Si todos están asignados, sugerir el más antiguo sin asignar
- Si pasados 5 segundos no hay respuesta, iniciar el proceso de selección automáticamente con el issue #1

### PASO 4: Iniciar Trabajo (Lógica de /start)

Una vez el usuario selecciona un issue, ejecutar:

1. **Obtener información del issue**:
   ```bash
   gh issue view <numero> --json title,labels,body,state
   ```

2. **Determinar tipo de branch**:
   - Buscar label `type: *`
   - Mapeo: feature→feat, bug→fix, refactor→refactor, etc.
   - Default: feat

3. **Crear nombre de branch**:
   - Formato: `<tipo>/<issue#>-<titulo-slugificado>`
   - Máximo 50 caracteres
   - Ejemplo: `feat/42-filtro-fecha-nominas`

4. **Verificar estado del repo**:
   ```bash
   git status
   ```
   - Si hay cambios sin commit, **DETENER** y avisar al usuario

5. **Crear y cambiar a la branch**:
   ```bash
   git checkout -b <nombre-branch>
   ```

6. **Asignar el issue** (solo si no está asignado):
   ```bash
   gh issue edit <numero> --add-assignee @me
   ```

7. **Actualizar labels**:
   ```bash
   gh issue edit <numero> --remove-label "status: needs-triage" --remove-label "status: ready"
   ```

8. **Invocar al agente issue-analyzer**:
   - Usar Task tool con subagent_type="issue-analyzer"
   - Obtener clasificación: backend/frontend/fullstack
   
9. **Invocar al agente issue-planner**:
   - Usar Task tool con subagent_type="issue-planner"
   - El agente usará la clasificación del analyzer para mejor contexto
   - El agente propondrá plan de implementación

### PASO 5: Mensaje Final

Mostrar resumen y próximos pasos:

```
✅ Listo para trabajar en #42

📋 Branch: feat/42-filtro-fecha-nominas
👤 Asignado a: @me
🤖 Clasificación: frontend (confidence: high)
🎯 Plan: [Resumen del issue-planner]

⏭️  Próximos pasos:

OPCIÓN 1: Implementación Manual ✏️
  1. Implementa los cambios siguiendo el plan
  2. Haz commits con formato: tipo(scope): mensaje #42
  3. Cuando termines, ejecuta: /github:pr
  4. Luego: /github:merge

OPCIÓN 2: Implementación Automática (RECOMENDADO) 🤖
  Ejecuta: /workflow:issue-complete

  El workflow automático:
  - Invoca frontend-implementer (basado en tu clasificación)
  - Implementa, crea PR, hace code review y mergea
  - Si falla, reintenta hasta 3 veces
  - Puedes continuar con siguiente issue si usas --loop

💡 Tip: Los commits deben incluir "#42" en el mensaje
```

## Casos Especiales

### Si no hay issues disponibles
```
ℹ️  No hay issues urgentes disponibles en este momento.

Estadísticas:
- Total issues abiertos: 0
- Issues bloqueados: 0
- Issues sin clasificar: 0

Puedes crear un nuevo issue con: /github:issue
```

### Si todos los issues están asignados
```
⚠️  Los 5 issues más urgentes ya están asignados.

¿Quieres trabajar en uno de ellos de todas formas?
- #42 asignado a @usuario1
- #38 asignado a @usuario2
- #25 asignado a ti
- #18 asignado a @usuario3
- #12 asignado a @usuario4

[Continuar con selección normal]
```

### Si hay cambios sin commit
```
⚠️  Tienes cambios sin commit en el repositorio.

Por favor, primero haz commit o stash de tus cambios:
  git add .
  git commit -m "mensaje"

O descártalos:
  git restore .

Luego ejecuta /github:next de nuevo.
```

## Ejemplo de Uso

```bash
# Uso básico (todos los issues)
/github:next

# Con filtro de proyecto
/github:next --project=7

# El comando:
# 1. Analiza prioridades (de todos los issues o del proyecto especificado)
# 2. Muestra top 5
# 3. Pregunta cuál resolver
# 4. Crea branch e inicia trabajo
# 5. Muestra mensaje final con instrucciones
```

## Integración con el Workflow

Este comando simplifica el flujo de:
```
/priorities → seleccionar → /start <issue#> → implementar → /merge
```

A:
```
/github:next → implementar → /github:merge → /github:next → ...
```

## Notas Importantes

- **SIEMPRE** verificar estado del repo antes de crear branch
- **SIEMPRE** mostrar mensaje final con instrucciones claras
- **NUNCA** crear branch si hay cambios sin commit
- **NUNCA** sobrescribir branches existentes
- Si el agente issue-planner falla, continuar sin el plan (no es bloqueante)
- **Filtro de proyecto**: Si se especifica `--project=N`, solo se analizan issues de ese proyecto
- El filtro de proyecto usa `gh project item-list` para obtener los issues del proyecto
