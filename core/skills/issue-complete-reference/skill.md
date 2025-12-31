---
name: issue-complete-reference
description: Referencia técnica de variables de sesión, estados, configuración JSON, y diagrama del flujo de 7 pasos para /workflow:issue-complete
---

# Issue Complete - Referencia Técnica

Documentación técnica de estrutura interna, variables de sesión, estado, y configuración.

---

## 🎯 Diagrama de Flujo (7 Pasos)

```
┌─────────────────────────────────────────────────────────────┐
│  /workflow:issue-complete [--loop] [--max=N] [--autonomous] │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  PASO 1: Seleccionar Issue           │
        │  ├─ /github:next                    │
        │  ├─ Parsr parámetros                │
        │  └─ Auto-seleccionar (si --loop)    │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  PASO 2: Iniciar Trabajo             │
        │  ├─ /github:start                   │
        │  ├─ Crear rama                      │
        │  └─ Asignar issue                   │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  PASO 3: Obtener Plan                │
        │  ├─ Skill: issue-planner            │
        │  ├─ Detectar tipo (backend/frontend)│
        │  └─ Mostrar plan                    │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  PASO 4: Implementación              │
        │  ├─ Seleccionar agente:             │
        │  │  ├─ backend-implementer          │
        │  │  ├─ frontend-implementer         │
        │  │  └─ fullstack-implementer        │
        │  ├─ Ejecutar cambios                │
        │  └─ Realizar commits                │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  PASO 5: Pull Request                │
        │  ├─ /github:pr                      │
        │  ├─ Crear PR                        │
        │  └─ Vincular a issue                │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  PASO 6: Code Review ⭐ CRÍTICO      │
        │  ├─ /quality:review (SIEMPRE)       │
        │  ├─ Validación:                     │
        │  │  ├─ TypeScript/Python            │
        │  │  ├─ FSD/Hexagonal                │
        │  │  ├─ Tests                        │
        │  │  └─ Convenciones                 │
        │  └─ Resultado:                      │
        │     ├─ ✅ APROBADO → PASO 7         │
        │     ├─ ⚠️ WARNINGS → PASO 7         │
        │     └─ ❌ RECHAZADO → Fase 4*       │
        │        (* si --autonomous)          │
        └──────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
           APROBADO        RECHAZADO (--autonomous)
                │                   │
                │         ┌─────────┴────────────┐
                │         │                      │
                │         ↓                      ↓
                │   AUTO-CORRECCIÓN (Fase 4)    ÉPOCA
                │   ├─ Ciclo 1/N               (Fase 2)
                │   ├─ Re-implement
                │   ├─ Re-review
                │   └─ ├─ ✅ → PASO 7
                │      └─ ❌ → Ciclo 2...
                │
                └─────────┬──────────┐
                          │          │
                          ↓          ↓
        ┌──────────────────────────────────────┐
        │  PASO 7: Merge                       │
        │  ├─ /github:merge                   │
        │  ├─ Detectar conflictos             │
        │  ├─ Auto-resolver (Fase 5*)         │
        │  │  (* si --autonomous)              │
        │  └─ Merge a main                    │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  ¿Siguiente Issue? (--loop)          │
        │  ├─ SI → Guardar sesión* → PASO 1   │
        │  │       (* si --save-session)       │
        │  └─ NO → Mostrar resumen             │
        └──────────────────────────────────────┘
                          │
                          ↓
        ┌──────────────────────────────────────┐
        │  FIN - Mostrar estadísticas          │
        └──────────────────────────────────────┘
```

---

## 📦 Estructura de Sesión Guardada

**Ubicación**: `.claude/session/workflow-session.json`

```json
{
  "sessionId": "workflow-20251231-143000-abc123def456",
  "startTime": "2025-12-31T08:30:00Z",
  "status": "in_progress",
  "configuration": {
    "loopMode": true,
    "maxIssues": 20,
    "projectNumber": 7,
    "labelFilter": null,
    "autoSelect": true,
    "autoFixReviewsCycles": 2,
    "autoResolveConflicts": true,
    "epicBreakdownOnFailure": true,
    "timeoutPerIssue": 10,
    "maxConsecutiveFailures": 3
  },
  "progress": {
    "issuesCompleted": 5,
    "issuesSkipped": 1,
    "issuesFailed": 0,
    "issuesConverted": 0,
    "consecutiveFailures": 0
  },
  "completedIssues": [
    {
      "number": 236,
      "title": "refactor UserListItem",
      "pr": 300,
      "status": "MERGED",
      "duration": 300,
      "timestamp": "2025-12-31T08:35:00Z",
      "autoFixed": false,
      "conflictsResolved": false
    },
    {
      "number": 235,
      "title": "refactor EntityFormModal",
      "pr": 301,
      "status": "MERGED",
      "duration": 240,
      "timestamp": "2025-12-31T08:42:00Z",
      "autoFixed": true,
      "fixCycles": 1,
      "conflictsResolved": false
    }
  ],
  "currentIssue": {
    "number": 234,
    "title": "refactor UserCard",
    "branch": "fix/234-refactor-usercard",
    "startTime": "2025-12-31T08:45:00Z",
    "pr": null,
    "status": "IMPLEMENTING"
  },
  "skippedIssues": [
    {
      "number": 237,
      "title": "complex feature X",
      "reason": "TIMEOUT",
      "timestamp": "2025-12-31T09:15:00Z",
      "duration": 600
    }
  ]
}
```

---

## 🔄 Estados de Issue

```
OPEN         → Issue seleccionado, listo para procesar
STARTED      → Branch creada, trabajo iniciado
PLANNING     → Obteniendo plan de implementación
IMPLEMENTING → Agente especializado ejecutando cambios
IMPLEMENTED  → Cambios completados, ready para PR
REVIEWING    → PR en code review
FIX_REVIEW   → Auto-corrección en progreso (Fase 4)
RESOLVE_CONF → Resolviendo conflictos de merge (Fase 5)
MERGED       → ✅ PR mergeado a main
SKIPPED      → ⚠️ Saltado (timeout, fallos, etc.)
EPIC         → 🎯 Convertido a Epic (demasiado complejo)
```

---

## 📊 Estados de Ciclo de Review

```
APPROVED               → ✅ Aprobado, procede a merge
APPROVED_WITH_WARNINGS → ⚠️ Aprobado pero con notas menores
REJECTED              → ❌ Rechazado, requiere correcciones
NEEDS_FIX             → 🔧 Requiere auto-corrección
FIXING_CYCLE_1        → 🔄 Auto-corrección ciclo 1
FIXING_CYCLE_2        → 🔄 Auto-corrección ciclo 2
FIXING_CYCLE_N        → 🔄 Auto-corrección ciclo N
FIXED                 → ✅ Auto-corregido, re-review
CONFLICT              → ⚠️ Merge tiene conflictos
CONFLICT_RESOLVING    → 🔧 Resolviendo conflictos
CONFLICT_RESOLVED     → ✅ Conflictos resueltos
```

---

## 📋 Estructura de Parámetros

```markdown
PARÁMETROS BÁSICOS:
├─ (sin flag)           → Modo normal, pregunta después de cada issue
├─ --loop               → Modo bucle continuo
├─ --autonomous         → Alias: activa todas las Fases 4-6
├─ --max=N              → Máximo de issues a procesar
├─ --project=N          → Solo issues del proyecto #N
└─ --label=NOMBRE       → Solo issues con label NOMBRE

PARÁMETROS DE AUTO-CORRECCIÓN (Fase 4):
├─ --auto-fix-reviews=N → Máximo N ciclos de corrección
└─ Default: 2 ciclos (con --autonomous)

PARÁMETROS DE CONFLICTOS (Fase 5):
├─ --auto-resolve-conflicts → Intenta resolver automáticamente
└─ Default: habilitado (con --autonomous)

PARÁMETROS DE ÉPICOS (Fase 2):
├─ --epic-breakdown-on-failure → Convierte issues complejos a Epic
└─ Default: habilitado (con --autonomous)

PARÁMETROS DE PERSISTENCIA (Fase 6):
├─ --save-session                → Guarda sesión después de cada issue
├─ --save-session=/path/file.json → Guardar en ruta personalizada
├─ --resume=/path/file.json      → Reanudar sesión guardada
├─ --timeout-per-issue=N        → Timeout máximo en minutos
└─ --max-consecutive-failures=N → Circuit breaker tras N fallos
    Default: timeout=10, failures=3 (con --autonomous)
```

---

## 🔧 Estructura de Comando Parseado

Después de procesar `$ARGUMENTS`, el sistema produce:

```python
parsed_args = {
    "mode": "loop" | "normal" | "resume",
    "flags": {
        "loop": bool,
        "autonomous": bool,
        "auto_fix_reviews": int,
        "auto_resolve_conflicts": bool,
        "epic_breakdown": bool,
        "skip_on_failure": bool,
        "save_session": bool | str,
        "resume": str | None,
    },
    "limits": {
        "max_issues": int,
        "project_filter": int | None,
        "label_filter": str | None,
        "timeout_per_issue": int,
        "max_consecutive_failures": int,
    }
}
```

---

## 📈 Variables de Progreso

```python
progress = {
    "started_at": timestamp,
    "issues_completed": int,
    "issues_skipped": int,
    "issues_failed": int,
    "issues_converted_to_epic": int,
    "consecutive_failures": int,
    "total_duration": int,  # seconds
    "average_duration_per_issue": float,
}
```

---

## ⏱️ Timings Típicos

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Seleccionar issue | 5s | Auto-select |
| Obtener plan | 15-30s | Análisis del issue |
| Implementación | 2-5 min | Depende complejidad |
| Code review | 10-20s | Validación |
| Auto-fix (1 ciclo) | 30-60s | Re-implementa |
| Merge sin conflictos | 5s | Instantáneo |
| Resolver conflicto (rebase) | 10-30s | Automático |
| Resolver conflicto (selectivo) | 15-45s | Config files |
| **Total por issue (exitoso)** | **2-5 min** | **Típico** |
| **Total por issue (con auto-fix)** | **3-7 min** | **Con corrección** |

**Estimaciones para sesión**:
- 5 issues: 10-25 minutos
- 10 issues: 20-50 minutos
- 20 issues: 40-100 minutos (~50 min promedio)
- 50 issues (--autonomous): 3-5 horas

---

## 🚨 Códigos de Error

### Selección (PASO 1)

```
ERR_001: No issues available
         Causa: No hay issues abiertos en el proyecto
         Acción: Crear issues o cambiar filtro

ERR_002: Invalid project number
         Causa: Proyecto no existe o sin acceso
         Acción: Verificar número de proyecto

ERR_003: Invalid label filter
         Causa: Label no existe
         Acción: Verificar nombre de label
```

### Implementación (PASO 4)

```
ERR_010: Implementation timeout
         Causa: Issue tardó más que --timeout-per-issue
         Acción: Aumentar timeout o dividir issue

ERR_011: Implementation failed
         Causa: Agente no pudo completar cambios
         Acción: Revisar issue manualmente

ERR_012: Critical test failure
         Causa: Tests fallan después de cambios
         Acción: Revisar lógica de implementación
```

### Code Review (PASO 6)

```
ERR_020: Review rejected (critical)
         Causa: Arquitectura, validación o tests
         Acción: --autonomous intenta auto-corregir (máx N ciclos)

ERR_021: Fix cycles exhausted
         Causa: Auto-corrección falló N veces
         Acción: Revisión manual requerida

ERR_022: Architecture violation
         Causa: Patrón hexagonal/FSD violado
         Acción: Corregir estructura del código
```

### Merge (PASO 7)

```
ERR_030: Merge conflicts detected
         Causa: PR tiene conflictos con main
         Acción: --autonomous intenta auto-resolver

ERR_031: Conflict resolution failed
         Causa: Conflictos no autoresolubles
         Acción: Resolver manualmente

ERR_032: Force push required
         Causa: Main adelante de la rama
         Acción: Rebase o resolver conflictos
```

### Circuit Breaker (FASE 6)

```
ERR_050: Circuit breaker activated
         Causa: N fallos consecutivos
         Acción: Pausar sesión, revisar issues, reanudar después

ERR_051: Session file not found
         Causa: Archivo de sesión no existe
         Acción: Verificar ruta de --resume

ERR_052: Session incompatible
         Causa: Sesión para otro proyecto
         Acción: Reanudar con proyecto correcto
```

---

## 🎯 Tabla de Decisión

**¿Cuándo se activa cada Fase?**

```
Fase 1 (Selección):
  ├─ SIEMPRE al inicio
  └─ Cada iteración del loop

Fase 2 (Epic Breakdown):
  ├─ SI: issue muy complejo (falla 3+ veces)
  ├─ SI: --epic-breakdown-on-failure activado
  └─ RESULTADO: Issue → Epic + 8 sub-issues

Fase 3 (Planning):
  ├─ SIEMPRE después de seleccionar issue
  └─ Detecta: backend | frontend | fullstack

Fase 4 (Auto-Corrección):
  ├─ SI: --autonomous O --auto-fix-reviews > 0
  ├─ SI: Code review rechazó
  ├─ CICLOS: máx N (default 2)
  └─ RESULTADO: ✅ corregido O ⚠️ saltado

Fase 5 (Auto-Conflictos):
  ├─ SI: --autonomous O --auto-resolve-conflicts
  ├─ SI: Merge tiene conflictos
  ├─ ESTRATEGIAS: rebase → merge ours → selective
  └─ RESULTADO: ✅ resuelto O ⚠️ manual

Fase 6 (Persistencia):
  ├─ SI: --autonomous O --save-session
  ├─ GUARDADO: Cada issue completado
  ├─ INTERVALO: ~10 minutos automático
  └─ RESULTADO: .claude/session/workflow-session.json

Fase 7 (Loop/Siguiente):
  ├─ SI: --loop O respuesta afirmativa
  ├─ RESET: Fallos consecutivos → 0
  └─ GOTO: PASO 1 (siguiente issue)
```

---

## 📊 Tabla de Compatibilidad de Parámetros

| Parámetro | Compatible con | Nota |
|-----------|---|---|
| --loop | Todos | Modo bucle |
| --autonomous | --loop, --max, --project | Activa todo |
| --auto-fix-reviews=N | --loop, --autonomous | Fase 4 |
| --auto-resolve-conflicts | --autonomous, --loop | Fase 5 |
| --save-session | --loop, --autonomous | Fase 6 |
| --resume=path | Excluyente (solo este) | Reanuda sesión |
| --max=N | --loop, --autonomous | Limita issues |
| --project=N | Todos | Filtra proyecto |
| --label=NOMBRE | Todos | Filtra label |
| --timeout-per-issue=N | Todos | Timeout custom |
| --max-consecutive-failures=N | Todos | Circuit breaker |

**Ejemplos de combinación válida**:
```bash
/workflow:issue-complete --loop --max=5 --autonomous
✅ Válido: loop + autonomous + max

/workflow:issue-complete --loop --project=7 --auto-fix-reviews=3
✅ Válido: loop + project + auto-fix

/workflow:issue-complete --resume=.claude/session/workflow-session.json
✅ Válido: SOLO resume

/workflow:issue-complete --autonomous --max=20 --timeout-per-issue=15
✅ Válido: autonomous + max + timeout custom
```

---

## 🔗 Variables de Contexto

Durante ejecución, Claude Code tiene acceso a:

```python
context = {
    "current_issue": {
        "number": int,
        "title": str,
        "body": str,
        "labels": list[str],
        "priority": "ALTA" | "MEDIA" | "BAJA",
        "assignee": str,
        "branch": str,
    },
    "current_pr": {
        "number": int,
        "url": str,
        "status": "DRAFT" | "OPEN" | "MERGED",
        "reviews": dict,
    },
    "session": {
        "sessionId": str,
        "started": timestamp,
        "completedCount": int,
        "currentIndex": int,
        "maxIssues": int,
    },
    "repository": {
        "owner": str,
        "name": str,
        "mainBranch": str,
        "projects": dict,
    }
}
```

---

## 📝 Logging y Diagnóstico

Cada sesión genera logs en:

```
.claude/logs/workflow-YYYYMMDD-HHMMSS.log
```

Incluye:

```
[14:00:00] [PASO 1] Seleccionando issue...
[14:00:05] [PASO 1] Auto-seleccionado #236 (prioridad ALTA)
[14:00:15] [PASO 3] Tipo detectado: frontend
[14:00:30] [PASO 4] Ejecutando frontend-implementer...
[14:02:45] [PASO 4] Implementación completada (2m 15s)
[14:02:50] [PASO 5] Creando PR #300...
[14:03:00] [PASO 6] Ejecutando code review...
[14:03:15] [PASO 6] RESULTADO: APROBADO ✅
[14:03:20] [PASO 7] Mergeando PR #300...
[14:03:25] [PASO 7] Merge exitoso ✅
[14:03:25] [SESIÓN] Issue #236 completado (1/20)
[14:03:30] [SESIÓN] Guardado a .claude/session/workflow-session.json
```

---

## 🎯 Matriz de Responsabilidad

| Tarea | Responsable | Trigger |
|-------|---|---|
| Seleccionar issue | /github:next | PASO 1 |
| Crear rama | /github:start | PASO 2 |
| Obtener plan | Skill: issue-planner | PASO 3 |
| Implementar | Agente especializado | PASO 4 |
| Crear PR | /github:pr | PASO 5 |
| Revisar código | Skill: quality:review | PASO 6 |
| Auto-corregir | Agente + quality:review | FASE 4 |
| Auto-resolver conflictos | /github:merge + lógica | FASE 5 |
| Mergear | /github:merge | PASO 7 |
| Guardar sesión | Sistema interno | Cada issue |
| Crear Epic | Sistema interno | FASE 2 |

---

## 🔗 Ver También

- `/workflow:issue-complete` - Comando principal
- `issue-complete-advanced` - Parámetros avanzados
- `issue-complete-examples` - 8 ejemplos detallados con outputs
