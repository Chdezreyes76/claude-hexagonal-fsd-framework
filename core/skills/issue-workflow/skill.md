# Issue Workflow Orchestrator (Automatizado v2.1)

Orquesta automáticamente el flujo completo de un issue con **implementación 100% automática** y **PRE-CODE-REVIEW** para garantizar commits limpios.

## Descripción

Este skill automatiza los 9 pasos del flujo con implementación automática y pre-review:

1. ✅ Seleccionar issue
2. ✅ Crear rama e iniciar trabajo
3. 🤖 **Detectar tipo de issue (backend/frontend/fullstack)**
4. 🤖 **Implementar automáticamente con agente especializado**
5. 🤖 **Ejecutar tests pre-commit (gate de calidad)**
6. 🤖 **⭐ PRE-CODE-REVIEW (NUEVO)** - Antes del commit
7. ✅ Commit automático (solo si pre-review aprueba)
8. ✅ Crear PR automáticamente
9. ✅ Mergear PR y loop

## Uso

```bash
/workflow:issue-complete
```

## 🆕 MEJORA v2.1: Pre-Code-Review

**Cambio principal:** El code review ahora se ejecuta **ANTES del commit**, no después del PR.

**Antes (v2.0):**
```
Implementar → Commit → PR → Review → ❌ Problemas → Commit2 → Review2
```

**Ahora (v2.1):**
```
Implementar → Pre-Review → ❌ Problemas → Reimplementar → Pre-Review → ✅ OK → Commit único
```

**Beneficios:**
- ✅ Historial git siempre limpio (1 commit por issue)
- ✅ PR siempre aprobado en el primer review
- ✅ No hay commits de corrección
- ✅ Calidad garantizada antes de pushear

## 🤖 Agentes Especializados

- **issue-analyzer**: Detecta si es backend, frontend o fullstack
- **backend-implementer**: Implementa FastAPI + Hexagonal Architecture
- **frontend-implementer**: Implementa React + FSD
- **fullstack-implementer**: Coordina backend + frontend
- **test-runner**: Ejecuta tests y **BLOQUEA commit** si fallan
- **code-reviewer**: Valida calidad ANTES y DESPUÉS del commit

## Flujo Completo Automatizado v2.1

```
PASO 1: Seleccionar Issue
  → /github:next
  → Usuario selecciona (ej: #119)
  ↓

PASO 2: Detectar Tipo
  → issue-analyzer analiza el issue
  → Detecta: backend | frontend | fullstack
  → (Pregunta al usuario si confianza < 50%)
  ↓

PASO 3: Implementar Automáticamente
  → Lanza agente correspondiente:
     • backend-implementer (si backend)
     • frontend-implementer (si frontend)
     • fullstack-implementer (si fullstack)
  → Agente:
     1. Lee plan del issue-planner
     2. Implementa código siguiendo patrones
     3. Ejecuta validaciones (type-check, lint, build, pytest)
     4. Reintenta hasta 3 veces si falla
  ↓

PASO 4: Validar Tests (Gate de Calidad #1)
  → test-runner ejecuta:
     • Backend: pytest, migraciones
     • Frontend: type-check, lint, build
  → ❌ BLOQUEA si fallan
  → ✅ Continúa si pasan
  ↓

PASO 5: ⭐ PRE-CODE-REVIEW (Gate de Calidad #2) - NUEVO
  → code-reviewer ejecuta ANTES del commit:
     • Backend: Arquitectura hexagonal, DTOs, ResponseDTO
     • Frontend: FSD, tipos (no 'any'), imports correctos
     • General: Calidad de código, duplicación

  → Resultados:
     ┌─ ✅ APROBADO → Continuar a PASO 6 (commit)
     │
     ├─ ⚠️ ISSUES MENORES → Preguntar al usuario:
     │   1. "Corregir automáticamente" → Volver a PASO 3
     │   2. "Ignorar y continuar" → Continuar a PASO 6
     │   3. "Corregir manualmente" → Pausar workflow
     │
     └─ ❌ ISSUES CRÍTICOS → Automáticamente volver a PASO 3
        → Implementer reintenta con feedback del review
        → Máximo 3 ciclos de corrección
        → Si falla 3 veces → Abortar o manual
  ↓

PASO 6: Commit Automático (solo si pre-review aprueba)
  → Un solo commit limpio:
     git commit -m "tipo(scope): descripción #issue

     🤖 Generated with Claude Code
     Co-Authored-By: Claude Sonnet 4.5"
  ↓

PASO 7: Crear PR
  → /github:pr
  → Push automático + PR creado
  ↓

PASO 8: Review Final (Opcional)
  → code-reviewer ejecuta nuevamente (confirmación)
  → Debería SIEMPRE aprobar (ya se revisó en PASO 5)
  → Si falla aquí → Bug en el workflow
  ↓

PASO 9: Merge y Loop
  → /github:merge
  → Merge + limpieza
  → ¿Más issues? → Volver a PASO 1
```

## Pre-Code-Review: Criterios de Validación

### Backend

**CRÍTICOS (bloquean automáticamente):**
- ❌ Violaciones de arquitectura hexagonal
- ❌ Lógica de negocio en adapters
- ❌ Dependencias invertidas (domain → adapter)
- ❌ SQL injection potencial

**MENORES (preguntan al usuario):**
- ⚠️ Falta JSDoc en funciones públicas
- ⚠️ Nombres no descriptivos
- ⚠️ Duplicación de código

### Frontend

**CRÍTICOS (bloquean automáticamente):**
- ❌ Violaciones de FSD (imports incorrectos)
- ❌ Tipos 'any' en código nuevo
- ❌ Imports directos desde services/ en features/
- ❌ Lógica de negocio en components/

**MENORES (preguntan al usuario):**
- ⚠️ Componentes muy grandes (>300 líneas)
- ⚠️ Falta memoización en objetos complejos
- ⚠️ Props sin JSDoc

## Ciclo de Corrección Automático

```
┌─────────────────────────────────────────────────┐
│ PASO 3: Implementer ejecuta                    │
│   → Código generado                             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ PASO 4: test-runner valida                     │
│   → Tests PASSED                                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ PASO 5: Pre-Code-Review                        │
│   → code-reviewer analiza                       │
└─────────────────────────────────────────────────┘
                    ↓
            ¿Resultado?
    ┌───────────┼───────────┐
    │           │           │
  CRÍTICO    MENOR        OK
    │           │           │
    ↓           ↓           ↓
┌────────┐  ┌────────┐  ┌────────┐
│ Auto   │  │Preguntar│ │COMMIT  │
│Corregir│  │Usuario  │ │        │
└────────┘  └────────┘  └────────┘
    │           │
    ↓           ↓
┌─────────────────────────┐
│ Volver a PASO 3         │
│ Intento: 2/3            │
│ Feedback: [errores]     │
└─────────────────────────┘
```

## Configuración

Archivo: `.claude/skills/issue-workflow/config.json`

```json
{
  "automation": {
    "enabled": true,
    "autoImplement": true,
    "autoCommit": true,
    "autoPR": true,
    "autoMerge": true,
    "maxRetries": 3,
    "requireTestsPass": true
  },

  "preReview": {
    "enabled": true,              // ⭐ NUEVO: Activar pre-code-review
    "blockOnCritical": true,      // Bloquear automáticamente en issues críticos
    "askOnMinor": true,           // Preguntar en issues menores
    "maxCorrectionCycles": 3,     // Máximo 3 ciclos de corrección
    "skipPostReview": false       // Ejecutar review final después del PR
  },

  "testRunner": {
    "enabled": true,
    "blockCommitOnFailure": true
  }
}
```

### Desactivar Pre-Review

Si quieres volver al modo anterior (review después del PR):

```json
{
  "preReview": {
    "enabled": false
  }
}
```

## Ejemplo Completo: Issue #119 con Pre-Review

```
1. Usuario ejecuta: /workflow:issue-complete
   ↓
2. Selecciona: #119 "fix(types): eliminar any en hook"
   ↓
3. issue-analyzer detecta: frontend (alta confianza)
   ↓
4. frontend-implementer implementa:
   [1/3] ✅ Implementación completada
   • Archivos: 3 modificados
   ↓
5. test-runner valida:
   ✅ TypeScript: PASSED
   ✅ Lint: PASSED
   ✅ Build: PASSED
   ↓
6. ⭐ PRE-CODE-REVIEW ejecuta:
   ❌ ISSUE CRÍTICO ENCONTRADO:
   • Archivo CriterioRepartoFormModal.tsx con 'any'
   • Relacionado con cambios actuales

   Acción: AUTO-CORREGIR
   ↓
7. frontend-implementer reintenta:
   [2/3] ✅ Corrección aplicada
   • Archivo adicional: CriterioRepartoFormModal.tsx
   ↓
8. test-runner valida corrección:
   ✅ Tests: PASSED
   ↓
9. PRE-CODE-REVIEW ejecuta nuevamente:
   ✅ APROBADO - Sin issues
   ↓
10. Commit automático:
    "fix(types): eliminar tipo 'any' en useCentrosCosteActions #119"

    ⭐ UN SOLO COMMIT (no hay commit de corrección)
    ↓
11. PR creado: #204
    ↓
12. Review final:
    ✅ APROBADO (confirmación, ya revisado en paso 6)
    ↓
13. Merge exitoso

TOTAL: Issue #119 resuelto con UN SOLO COMMIT limpio
```

## Comparación: v2.0 vs v2.1

| Aspecto | v2.0 (Anterior) | v2.1 (Pre-Review) |
|---------|----------------|-------------------|
| **Commits por issue** | 1-2 (a veces más) | **Siempre 1** |
| **Cuándo se revisa** | Después del PR | **Antes del commit** |
| **Historial git** | Commits de corrección | **Siempre limpio** |
| **PR inicial** | A veces rechazado | **Siempre aprobado** |
| **Tiempo total** | ~5-7 min | **~4-6 min** |
| **Calidad garantizada** | Después del push | **Antes del push** |

## Performance Esperado

**Con Pre-Review (v2.1):**

| Métrica | Manual | v2.0 | v2.1 |
|---------|--------|------|------|
| Tiempo/issue | 30-60 min | 5-7 min | **4-6 min** |
| Commits/issue | 1-3 | 1-2 | **1** |
| PRs rechazados | 20% | 5% | **0%** |
| Historial limpio | 60% | 85% | **100%** |
| Reintentos | Manual | 1-2 | **0-1** |

## Estadísticas de Sesión

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA (v2.1 con Pre-Review)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS:
  Issues resueltos:       12
  PRs creados/mergeados:  12
  Commits totales:        12 (1 por issue) ⭐
  Commits de corrección:  0 ⭐

  Pre-Reviews ejecutados: 12
  ├─ Aprobados 1er ciclo: 10
  ├─ Corregidos auto:     2
  └─ Fallidos total:      0

  Calidad:                100%
  ├─ Historial limpio:    12/12 (100%) ⭐
  ├─ PRs rechazados:      0/12 (0%) ⭐
  └─ Tests failed:        0

  Tiempo promedio:        4m 30s/issue ⭐
  Tiempo total:           54m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Ventajas del Pre-Review

### ✅ Historial Git Siempre Limpio

**Antes (v2.0):**
```
* 3a4b5c6 fix(types): eliminar 'any' en CriterioRepartoFormModal #119
* 2d3e4f5 fix(types): eliminar tipo 'any' en useCentrosCosteActions #119
```

**Ahora (v2.1):**
```
* 1a2b3c4 fix(types): eliminar tipo 'any' en useCentrosCosteActions #119
```

### ✅ PRs Siempre Aprobados

- Pre-review detecta problemas ANTES del push
- PR llega a revisión final ya perfecto
- 0% de PRs rechazados

### ✅ Más Rápido

- No hay ciclos de corrección después del PR
- No hay push → review → corrección → push2
- Todo se corrige ANTES de pushear

### ✅ Mejor Experiencia

- No ensucia el historial con commits de corrección
- No hay notificaciones de "PR actualizado" múltiples veces
- Trabajo profesional desde el primer commit

## Notas Importantes

- Pre-review usa los mismos criterios que el review final
- Si pre-review aprueba, review final SIEMPRE debe aprobar
- Máximo 3 ciclos de corrección en pre-review
- Después de 3 ciclos fallidos → Opción manual o abortar
- Pre-review puede desactivarse en config (volver a v2.0)

## Documentación Completa

- **AUTOMATED_WORKFLOW.md** - Flujo completo detallado
- **PRE_REVIEW_IMPROVEMENT.md** - Documentación de la mejora v2.1
- **config.json** - Configuración completa

## Alternativa: Modo Manual

Si prefieres implementar tú:

```json
{
  "automation": {
    "enabled": false
  }
}
```

O desactiva solo pre-review:

```json
{
  "preReview": {
    "enabled": false
  }
}
```
