# 📋 Guía de Implementación del Skill issue-workflow

## Resumen Ejecutivo

Este documento explica cómo el skill `/workflow:issue-complete` implementa la orquestación del flujo de trabajo de 7 pasos.

## Arquitectura Interna

### 1. Entry Point
```
Usuario ejecuta: /workflow:issue-complete
         ↓
   Inicia skill.md
         ↓
   Lee config.json
         ↓
   Inicia Step 1
```

### 2. Step 1: Análisis de Issues (issue-planner agent)

```python
# Pseudocódigo
def step_1_analyze():
    issues = gh_api.get_issues(state='open')
    issues_sorted = sort_by_priority(issues)
    top_3 = issues_sorted[:3]

    show_to_user(top_3)
    selected = ask_user_question("Cuál quieres?")

    return selected
```

**Herramientas usadas:**
- `gh issue list` → Obtener issues
- `AskUserQuestion` → Preguntar cuál seleccionar

---

### 3. Step 2: Crear Rama (/github:start)

```bash
# Automáticamente ejecuta:
gh issue view <number> --json title,labels,body
git checkout -b <rama_generada>
gh issue edit <number> --add-assignee @me
```

**Herramientas usadas:**
- `Skill(/github:start)` → Delega a skill github:start

---

### 4. Step 3: Esperar Implementación

```
Sistema muestra:
- ✅ Rama creada
- ✅ Issue asignado
- 📝 Plan del issue-planner
- ⏳ "Di 'listo' cuando termines"

Espera entrada del usuario:
- "listo" → Continúa a Step 4
- "pausa" → Pausa workflow
- "ayuda" → Muestra opciones
```

**Herramientas usadas:**
- `AskUserQuestion` → Esperar "listo"
- `Bash(git status)` → Verificar cambios antes de PR

---

### 5. Step 4: Crear PR (/github:pr)

```bash
# Automáticamente ejecuta:
git push -u origin <rama>
gh pr create --title "..." --body "..."
```

**Herramientas usadas:**
- `Skill(/github:pr)` → Delega a skill github:pr

---

### 6. Step 5: Code Review (/quality:review) ⭐ CRÍTICO

```python
# Pseudocódigo
def step_5_review():
    # Ejecuta el skill code-reviewer
    review_result = run_skill('/quality:review')

    if review_result.status == 'APPROVED':
        return True
    else:
        show_errors(review_result.errors)
        ask("¿Quieres rehacer? (si/recheck/salir)")

        if user_says 'recheck':
            return step_5_review()  # Recursivo
        elif user_says 'salir':
            abort_workflow()
```

**Herramientas usadas:**
- `Skill(/quality:review)` → Ejecutar code-reviewer agent
- `AskUserQuestion` → Preguntar qué hacer si falla

---

### 7. Step 6: Mergear PR (/github:merge)

```bash
# Automáticamente ejecuta (si config.autoMerge = true):
gh pr merge <number> --merge
git checkout master
git pull origin master
git branch -D <rama_local>
git push origin --delete <rama_remota>
```

**Herramientas usadas:**
- `Skill(/github:merge)` → Delega a skill github:merge

---

### 8. Step 7: Siguiente Issue (/github:next)

```bash
# Automáticamente ejecuta:
/github:next

# Esto vuelve al Step 1 (loop)
```

**Herramientas usadas:**
- `Skill(/github:next)` → Delega a skill github:next

---

## Control de Flujo (Decision Tree)

```
START
  │
  ├─→ [1] Analizar issues
  │   ├─→ Usuario selecciona
  │   └─→ Obtener plan (issue-planner)
  │
  ├─→ [2] Crear rama (/github:start)
  │   └─→ Issue asignado
  │
  ├─→ [3] Usuario implementa
  │   ├─→ Usuario dice "listo"
  │   ├─→ "pausa" → PAUSE
  │   └─→ "salir" → ABORT
  │
  ├─→ [4] Crear PR (/github:pr)
  │   └─→ PR creado
  │
  ├─→ [5] Code Review (/quality:review) ⭐
  │   ├─→ APROBADO → [6]
  │   ├─→ RECHAZADO
  │   │   ├─→ "recheck" → volver a [3]
  │   │   ├─→ "salir" → ABORT
  │   │   └─→ "pausa" → PAUSE
  │   └─→ ERRORES
  │       └─→ mostrar errores, preguntar qué hacer
  │
  ├─→ [6] Mergear (/github:merge)
  │   ├─→ SUCCESS → [7]
  │   ├─→ CONFLICT
  │   │   ├─→ "resolv" → resolver manualmente
  │   │   ├─→ "rebase" → rebase automático
  │   │   └─→ "salir" → ABORT
  │   └─→ ERRORES
  │       └─→ mostrar errores, preguntar
  │
  ├─→ [7] Siguiente Issue (/github:next)
  │   ├─→ ¿Más issues?
  │   │   ├─→ SÍ → volver a [1] (loop)
  │   │   └─→ NO → FINISH
  │   └─→ mostrar resumen sesión
  │
  └─→ END

ESTADOS ESPECIALES:
  - PAUSE → Volver a: /workflow:issue-complete --resume
  - ABORT → Volver a master, limpiar ramas
  - FINISH → Mostrar estadísticas, salir
```

---

## Manejo de Errores

### Si algo falla en cualquier Step:

```python
def safe_execute(step_name, command):
    try:
        result = execute(command)
        return result
    except Exception as e:
        # Log error
        logger.error(f"{step_name} falló: {e}")

        # Mostrar al usuario
        show_error(step_name, e)

        # Opción de recuperación
        ask_recovery_options()

        # Volver a master si es necesario
        ensure_clean_state()

        return None
```

### Estados de Recuperación:

| Paso | Fallo | Recuperación |
|------|-------|--------------|
| 2 | No crea rama | Crear manualmente: `git checkout -b ...` |
| 4 | No crea PR | Ejecutar: `/github:pr` manualmente |
| 5 | Review rechaza | Editar código, `git add .`, `git commit`, `recheck` |
| 6 | Conflict | Resolver merge conflict, `git merge --continue`, `recheck` |

---

## Parámetros de Configuración

### En `config.json`:

```json
{
  "autoReview": true,           // Step 5 automático
  "autoMerge": true,            // Step 6 automático
  "stopOnReviewFails": true,    // Parar si review falla
  "requireTests": false,         // Requerir tests para review
  "requireDocs": false,          // Requerir JSDoc
  "priorityFilter": ["critical", "high", "medium", "low"],
  "excludeLabels": ["status:blocked"],
  "maxIssuesPerSession": null   // null = infinito
}
```

### Override en Runtime:

```bash
# Forzar que pida confirmación antes de mergear
/workflow:issue-complete --no-auto-merge

# Solo resolver issues de ALTA prioridad
/workflow:issue-complete --priority=high,critical

# Máximo 5 issues por sesión
/workflow:issue-complete --max-issues=5
```

---

## Logging y Debugging

### Ver logs de sesión:

```bash
# Ver logs en tiempo real
tail -f .claude/logs/workflow-<timestamp>.log

# Ver resumen de última sesión
cat .claude/logs/workflow-latest-summary.txt
```

### Modo Debug:

```bash
# Ejecución con debug
/workflow:issue-complete --debug

# Muestra:
- Todos los comandos ejecutados
- Todos los outputs
- Estados internos
- Timing de cada paso
```

---

## Integración con Otros Skills

### Dependencias:

```
issue-workflow
├─→ /github:next (selecciona issue)
├─→ /github:start (crea rama)
├─→ /github:pr (crea PR)
├─→ /quality:review (valida código) ⭐
├─→ /github:merge (mergea)
└─→ issue-planner agent (obtiene plan)
```

### Order de ejecución:

```
1. /github:next     → Get issues
2. /github:start    → Create branch + assign
3. issue-planner    → Get plan (background)
4. /github:pr       → Create PR
5. /quality:review  → Code review (BLOCKING)
6. /github:merge    → Merge PR
7. /github:next     → Next issue (loop)
```

---

## Performance

### Tiempo estimado por issue:

| Paso | Tiempo |
|------|--------|
| Análisis (step 1) | 3-5s |
| Crear rama (step 2) | 2-3s |
| Usuario implementa (step 3) | Variable ⏱️ |
| Crear PR (step 4) | 5-10s |
| Code review (step 5) | 10-30s |
| Mergear (step 6) | 5-10s |
| Siguiente issue (step 7) | 2-3s |
| **TOTAL** | ~40-80s (sin step 3) |

### Optimizaciones:

- Step 1 y 2 ejecutan en paralelo (si es posible)
- Step 5 puede ejecutarse con caché si no hay cambios
- Step 7 es rápido porque reutiliza análisis previo

---

## Casos de Uso

### Caso 1: Session Corta (1-2 issues)

```bash
/workflow:issue-complete

# Selecciona 1-2 issues
# Implementa
# Termina con "salir"
```

### Caso 2: Full Day (8-10 issues)

```bash
/workflow:issue-complete --max-issues=10

# Loop automático
# Review y merge automático
# Termina cuando no hay más issues o llega a 10
```

### Caso 3: Solo Review (Sin Mergear)

```bash
/workflow:issue-complete --no-auto-merge

# Implementa
# Review automático
# Espera confirmación manual antes de mergear
```

### Caso 4: Pausado / Reanudado

```bash
/workflow:issue-complete

# [Pausa en step 3 con "pausa"]

# Más tarde...
/workflow:issue-complete --resume

# Continúa desde donde pausó
```

---

## Conclusión

El skill `/workflow:issue-complete` implementa un **Agente Orquestador Ligero** que:

1. ✅ Automatiza los 7 pasos del flujo
2. ✅ Fuerza `/quality:review` (antes olvidado)
3. ✅ Maneja errores gracefully
4. ✅ Permite pausar y resumir
5. ✅ Totalmente configurable
6. ✅ Mantiene estado consistente

**Resultado**: Desarrollo más rápido y consistente, con garantía de code review en cada PR.
