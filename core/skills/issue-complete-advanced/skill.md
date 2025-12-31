---
name: issue-complete-advanced
description: Parámetros avanzados, fases 4-6, timeouts, circuit breaker y session persistence para /workflow:issue-complete
---

# Issue Complete - Documentación Avanzada

Referencia completa de parámetros avanzados, fases 4-6, y características de persistencia para `/workflow:issue-complete`.

## 🎯 Parámetros Avanzados

### Parámetros de Persistencia de Sesión (Fase 6)

#### `--save-session` y `--save-session=ruta`
Guarda el estado de la sesión después de cada issue resuelto.

```bash
/workflow:issue-complete --loop --max=20 --save-session
# Guarda en: .claude/session/workflow-session.json (default)

/workflow:issue-complete --loop --save-session=/custom/path/session.json
# Guarda en ruta personalizada
```

**Estructura de sesión guardada**:
```json
{
  "sessionId": "unique-id-timestamp",
  "startTime": "2025-12-31T08:30:00Z",
  "status": "in_progress",
  "configuration": {
    "loopMode": true,
    "maxIssues": 20,
    "projectNumber": null,
    "labelFilter": null,
    "autoSelect": true,
    "autoFixReviewsCycles": 2,
    "autoResolveConflicts": true,
    "timeoutPerIssue": 10,
    "maxConsecutiveFailures": 3
  },
  "progress": {
    "issuesCompleted": 5,
    "issuesSkipped": 1,
    "issuesFailed": 0,
    "issuesConverted": 0
  },
  "completedIssues": [
    {"number": 236, "title": "refactor X", "pr": 300, "timestamp": "2025-12-31T08:35:00Z"},
    {"number": 235, "title": "feat Y", "pr": 301, "timestamp": "2025-12-31T08:42:00Z"}
  ],
  "currentIssue": {"number": 234, "title": "fix Z", "startTime": "2025-12-31T08:45:00Z"}
}
```

#### `--resume=ruta`
Reanuda una sesión guardada anteriormente.

```bash
/workflow:issue-complete --resume=.claude/session/workflow-session.json
# Continúa desde donde se quedó
```

**Validaciones**:
- Verifica que la sesión exista
- Valida que el estado sea "in_progress" o "paused"
- Si `--project=N` se especifica, verifica que coincida con la sesión
- Si proyecto no coincide: error y aborta

### Parámetros de Timeout y Protección (Fase 6)

#### `--timeout-per-issue=N`
Timeout máximo en minutos por issue.

```bash
/workflow:issue-complete --loop --timeout-per-issue=15
# Cada issue tiene máx 15 minutos

/workflow:issue-complete --loop --timeout-per-issue=5
# Timeout más agresivo (5 minutos)
```

**Comportamiento si excede timeout**:
1. Cancela la implementación actual
2. Muestra: "⏱️ TIMEOUT: Issue #X tardó más de 15 minutos"
3. Salta el issue (lo marca como skipped)
4. Continúa con siguiente issue

**Default**: 10 minutos (con --autonomous)

#### `--max-consecutive-failures=N`
Circuit breaker: detiene sesión tras N fallos consecutivos.

```bash
/workflow:issue-complete --loop --max-consecutive-failures=3
# Para tras 3 fallos consecutivos

/workflow:issue-complete --loop --max-consecutive-failures=10
# Tolerante: permite hasta 10 fallos consecutivos
```

**Comportamiento**:
```
Issue 1: ❌ Fallo (consecutivo: 1)
Issue 2: ❌ Fallo (consecutivo: 2)
Issue 3: ❌ Fallo (consecutivo: 3)
Issue 4: ⏸️ CIRCUIT BREAKER ACTIVADO
         → Sesión pausada
         → Salida: "Circuit breaker tras 3 fallos consecutivos"
         → Puedes reanudar después
```

**Default**: 3 fallos (con --autonomous)

### Parámetros de Auto-Corrección (Fase 4)

#### `--auto-fix-reviews=N`
Máximo número de ciclos de auto-corrección en code review.

```bash
/workflow:issue-complete --loop --auto-fix-reviews=2
# Si review rechaza: intenta corregir 2 veces

/workflow:issue-complete --loop --auto-fix-reviews=5
# Más tolerante: hasta 5 intentos de corrección
```

**Flujo de auto-corrección**:
```
[PASO 4] Code Review
  → Review: ❌ REJECTED
  → Auto-corrección ciclo 1
    → Re-implementa cambios
    → Review: ❌ REJECTED
  → Auto-corrección ciclo 2
    → Re-implementa cambios
    → Review: ✅ APPROVED
    → Continúa a Merge
```

**Si agota ciclos**:
- Marca issue como skipped
- Guarda feedback del review
- Continúa con siguiente issue

**Default**: 2 ciclos (con --autonomous)

### Parámetros de Resolución de Conflictos (Fase 5)

#### `--auto-resolve-conflicts`
Intenta resolver conflictos de merge automáticamente.

```bash
/workflow:issue-complete --loop --auto-resolve-conflicts
```

**Estrategias de resolución** (en orden):
1. **Rebase**: Prefiere mantener historial limpio
2. **Merge con 'ours'**: Estrategia conservadora
3. **Selective**: Auto-resuelve config files (package.json, requirements.txt, etc.)

**Éxito esperado**: 67% de conflictos se resuelven automáticamente

### Parámetros de Épicos (Fase 2)

#### `--epic-breakdown-on-failure`
Si detecta issue demasiado complejo: lo convierte a Epic en GitHub.

```bash
/workflow:issue-complete --loop --epic-breakdown-on-failure
```

**Cuándo se activa**:
- Issue lleva > 10 minutos en implementación
- Review rechaza > 2 veces
- Merge falla por complejidad

**Qué hace**:
1. Crea Epic en GitHub
2. Extrae sub-issues del análisis
3. Quita issue original de backlog
4. Continúa con siguiente

---

## 🔄 Fases Avanzadas (4-6)

### Fase 4: Auto-Corrección de Code Review

**Activada con**: `--auto-fix-reviews=N`

```
Ciclo básico:
  1. Code Review rechaza PR
  2. Parser output del reviewer
  3. Identifica problemas
  4. Re-implementa con correcciones
  5. Commit nuevo: "fix: correcciones de review"
  6. Push rama
  7. Vuelve a Code Review
  8. Si rechaza: repite hasta N ciclos
  9. Si aprueba: continúa a Merge
```

**Tipos de problemas que corrige**:
- Errores de TypeScript
- Violaciones de FSD
- Tests faltantes
- Convenciones de commits
- Duplicación de código

**Límites**:
- Máximo N ciclos (default 2)
- Máximo 5 minutos por ciclo
- Si no mejora: salta issue

### Fase 5: Auto-Resolución de Conflictos

**Activada con**: `--auto-resolve-conflicts`

```
Flujo:
  1. Merge intenta
  2. Detecta conflictos
  3. Estrategia 1: git rebase
     → Si funciona: ✅ Merge automático
  4. Si falla: Estrategia 2: merge --ours
     → Si funciona: ✅ Merge conservador
  5. Si falla: Estrategia 3: selective (config files)
     → Si funciona: ✅ Merge parcial
  6. Si todo falla: Skip issue
```

**Archivos que se resuelven automáticamente**:
- package.json / package-lock.json
- requirements.txt / Pipfile
- docker-compose.yml
- .env.example
- tsconfig.json
- .gitignore

### Fase 6: Session Persistence y Circuit Breaker

**Activada con**: `--save-session` y `--max-consecutive-failures=N`

```
Sesión guardada:
  - Cada 10 minutos
  - Después de cada issue completado
  - Estructura JSON con: config, progreso, issues completados
  - Permite reanudar sin perder contexto

Circuit Breaker:
  - Cuenta fallos consecutivos
  - Si supera máximo: pausa sesión
  - Genera reporte de diagnóstico
  - Permite reanudar después
```

---

## 🎯 Tabla de Combinaciones Comunes

| Caso | Comando | Parámetros | Características |
|------|---------|-----------|-----------------|
| **Sesión corta** | `--loop --max=5` | - | 5 issues, sin persistencia |
| **Sesión larga** | `--loop --max=50 --save-session` | Session persistence | Guarda progreso, puede reanudar |
| **Altamente autónoma** | `--loop --max=20 --autonomous` | Todo (Fases 4-6) | Auto-fix, auto-resolve, session |
| **Tolerante a fallos** | `--loop --max-consecutive-failures=10` | Circuit breaker largo | Permite hasta 10 fallos |
| **Timeout corto** | `--loop --timeout-per-issue=5` | Timeout agresivo | Issues rápidas o timeout |
| **Épicos complejos** | `--loop --epic-breakdown-on-failure` | Epic breakdown | Convierte complejos a Epic |
| **Con reintentos** | `--loop --auto-fix-reviews=5` | Auto-fix largo | Hasta 5 ciclos de corrección |

---

## 📊 Configuración por Defecto con `--autonomous`

```
--autonomous activa:
├── Auto-selección: ✅
├── Auto-fix reviews: 2 ciclos
├── Auto-resolve conflictos: ✅
├── Epic breakdown: ✅
├── Skip on failure: ✅
├── Save session: ✅
├── Timeout: 10 minutos
└── Circuit breaker: 3 fallos
```

---

## 🔍 Referencia de Estados

### Estados de Issue

```
OPEN         → Issue seleccionado, listo para procesar
IN_PROGRESS  → Siendo implementado
REVIEW       → En code review
FIX_REVIEW   → Auto-corrección en progreso (Fase 4)
RESOLVE_CONF → Resolviendo conflictos (Fase 5)
COMPLETED    → ✅ Mergeado
SKIPPED      → ⚠️ Saltado (timeout, fallos, etc.)
EPIC         → Convertido a Epic (demasiado complejo)
```

### Estados de Ciclo

```
APPROVED               → Review aprobó ✅
APPROVED_WITH_WARNINGS → Review aprobó con notas
REJECTED              → Review rechazó ❌
NEEDS_FIX             → Requiere auto-corrección
FIXED                 → Auto-corregido, re-review
CONFLICT              → Merge tiene conflictos
RESOLVED              → Conflictos resueltos
```

---

## ⏱️ Timings Típicos (con --autonomous)

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Seleccionar issue | 5s | Auto-select |
| Implementación | 1-3 min | Depende complejidad |
| Code review | 10-20s | Validación |
| Auto-fix (1 ciclo) | 30-60s | Re-implementa |
| Merge | 5s | Normalmente instantáneo |
| Resolver conflicto | 10-30s | Estrategias automáticas |
| **Total por issue** | **2-5 min** | **Típico** |

**Para 20 issues**: ~40-100 minutos (~50 minutos promedio)

---

## 🆘 Troubleshooting Avanzado

### "Circuit breaker activado después de 3 fallos"
```
Solución:
  1. Revisa logs de los 3 fallos
  2. Aumenta --timeout-per-issue si es timeout
  3. Aumenta --auto-fix-reviews si es review
  4. Reintenta con --max-consecutive-failures=5
  5. Resume sesión después de 10 minutos
```

### "Timeout en issue #X"
```
Solución:
  1. Aumenta --timeout-per-issue=15 (o más)
  2. O ejecuta issue manualmente: /workflow:issue-complete
  3. Si issue es muy complejo: use --epic-breakdown-on-failure
```

### "Auto-fix agotó ciclos, issue skipped"
```
Solución:
  1. Aumenta --auto-fix-reviews=5 (o más)
  2. Revisa feedback del review en sesión
  3. Implementa manualmente: /workflow:issue-complete
```

---

## 📌 Mejores Prácticas

1. **Iniciar con `--autonomous`**: Comienza con `--loop --max=10 --autonomous`
2. **Monitorear sesión**: Primeras 3 issues manualmente
3. **Ajustar parámetros**: Si muchos timeouts → aumenta timeout
4. **Usar persistencia**: `--save-session` para sesiones > 30 minutos
5. **Reintentos razonables**: 2-3 ciclos de auto-fix es típico
6. **Circuit breaker alto**: Comienza con 5, baja a 3 después

---

## 🔗 Ver También

- `/workflow:issue-complete` - Comando principal
- `issue-complete-examples` - 8 ejemplos detallados
- `issue-complete-reference` - Variables técnicas y referencia
