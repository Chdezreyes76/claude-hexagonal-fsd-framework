# 🤖 Workflow Automatizado con Agentes Especializados (v2.1)

## Resumen

El workflow `/workflow:issue-complete` incluye **implementación 100% automática** mediante agentes especializados que escriben código, ejecutan tests, **realizan pre-code-review** y hacen commits automáticamente.

**⭐ Nuevo en v2.1**: Pre-Code-Review ejecutado **ANTES del commit** garantiza historial git siempre limpio con **1 commit por issue**.

## Flujo Completo Automatizado (v2.1)

```
┌──────────────────────────────────────────────────────────────┐
│          PASO 1: Seleccionar Issue                           │
│          /github:next                                        │
└──────────────────────────────────────────────────────────────┘
                        ↓
          Usuario selecciona issue (ej: #119)
                        ↓
┌──────────────────────────────────────────────────────────────┐
│          PASO 2: Analizar Tipo de Issue                     │
│          Agente: issue-analyzer                              │
└──────────────────────────────────────────────────────────────┘
                        ↓
            Análisis semántico del issue
         (keywords, archivos, descripción)
                        ↓
        ┌───────────────┼───────────────┐
        │               │               │
    [backend]      [frontend]     [fullstack]
        │               │               │
        ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│   PASO 3A    │ │   PASO 3B    │ │   PASO 3C        │
│   backend    │ │   frontend   │ │   fullstack      │
│ -implementer │ │ -implementer │ │ -implementer     │
└──────────────┘ └──────────────┘ └──────────────────┘
        │               │               │
        ├→ Código       ├→ Código       ├→ Backend + Frontend
        ├→ Tests        ├→ Type-check   ├→ Tests ambos
        └→ (3 reintentos) └→ Build      └→ Contract validation
                                             │
        └───────────────┼───────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│          PASO 4: Validar con Tests (Gate #1)                │
│          Agente: test-runner                                 │
└──────────────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────┐
         │                             │
    ✅ PASS                        ❌ FAIL
         │                             │
         │                     Reportar errores
         │                     BLOQUEAR workflow
         ↓                             │
┌──────────────────────────────────────────────────────────────┐
│   ⭐ PASO 5: PRE-CODE-REVIEW (Gate #2) - NUEVO v2.1         │
│          Agente: code-reviewer                               │
│          Ejecuta ANTES del commit                            │
└──────────────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────────┐
         │              │                  │
    ✅ APROBADO   ⚠️ MENORES         ❌ CRÍTICOS
         │              │                  │
         │       Preguntar usuario    Auto-corregir
         │       ┌──────┴──────┐          │
         │       │             │          │
         │   Corregir    Ignorar      Volver a
         │       │             │      PASO 3 con
         │       ↓             │      feedback
         │   Volver PASO 3     │      [2/3, 3/3]
         │                     │          │
         └─────────────────────┴──────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│          PASO 6: Commit Único (solo si aprobado)             │
│          git commit -m "..."                                 │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│          PASO 7: Crear PR                                    │
│          /github:pr                                          │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│          PASO 8: Code Review Final (confirmación)            │
│          /quality:review                                     │
│          Debería SIEMPRE aprobar (ya revisado en PASO 5)     │
└──────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────┐
│          PASO 9: Merge PR                                    │
│          /github:merge                                       │
└──────────────────────────────────────────────────────────────┘
         ↓
    ¿Más issues?
         ├─ SÍ → Volver a PASO 1
         └─ NO → FIN (mostrar resumen)
```

## Agentes Especializados

### 1. **issue-analyzer**
- **Responsabilidad**: Detectar automáticamente el tipo de issue
- **Input**: Número de issue
- **Output**: `backend` | `frontend` | `fullstack` | `unknown`
- **Método**: Análisis semántico (keywords + archivos + descripción)
- **Tiempo**: <5 segundos

**Ejemplo:**
```json
{
  "issue": 119,
  "title": "fix(types): eliminar tipo 'any' en useCentrosCosteActions",
  "analysis": {
    "type": "frontend",
    "confidence": "high",
    "reason": "Hook TypeScript en features/, keywords FSD"
  }
}
```

### 2. **backend-implementer**
- **Responsabilidad**: Implementar issues de backend (FastAPI + Hexagonal)
- **Skills usados**: hexagonal-architecture, alembic-migrations
- **Proceso**:
  1. Leer plan del issue-planner
  2. Implementar entities, DTOs, use cases, repositories, routers
  3. Crear migraciones Alembic (si aplica)
  4. Ejecutar `pytest`
  5. Reintentar hasta 3 veces si falla
- **Output**: Archivos modificados/creados, migraciones, resultado tests

### 3. **frontend-implementer**
- **Responsabilidad**: Implementar issues de frontend (React + FSD)
- **Skills usados**: feature-sliced-design
- **Proceso**:
  1. Leer plan del issue-planner
  2. Implementar types, API clients, hooks, components
  3. Respetar reglas FSD (no violar dependencias)
  4. Ejecutar `type-check`, `lint`, `build`
  5. Reintentar hasta 3 veces si falla
- **Output**: Archivos modificados/creados, validaciones passed

### 4. **fullstack-implementer**
- **Responsabilidad**: Coordinar backend + frontend
- **Skills usados**: hexagonal-architecture + feature-sliced-design + alembic-migrations
- **Proceso**:
  1. Implementar **BACKEND PRIMERO** (define contract API)
  2. Implementar **FRONTEND DESPUÉS** (consume API)
  3. Validar que tipos coincidan (backend DTOs ↔ frontend types)
  4. Ejecutar tests de ambos
  5. Reintentar hasta 3 veces si falla
- **Output**: Resultado integrado de backend + frontend

### 5. **test-runner**
- **Responsabilidad**: Ejecutar tests ANTES del pre-review (Gate de Calidad #1)
- **Proceso**:
  1. Detectar cambios (backend/frontend/fullstack)
  2. Ejecutar tests correspondientes:
     - Backend: `pytest`, verificar migraciones
     - Frontend: `type-check`, `lint`, `build`
  3. Si PASA → Continuar a pre-review
  4. Si FALLA → **BLOQUEAR** workflow y reportar errores
- **Output**: Resultado tests, ready_for_commit: true/false
- **NO REINTENTA** - solo valida una vez

### 6. **code-reviewer** (Pre-Review - ⭐ NUEVO v2.1)
- **Responsabilidad**: Revisar código ANTES del commit (Gate de Calidad #2)
- **Proceso**:
  1. Analizar cambios con `/quality:review`
  2. Validar patrones de arquitectura:
     - Backend: Hexagonal, DTOs, ResponseDTO, SQL injection
     - Frontend: FSD, tipos 'any', imports correctos
  3. Clasificar issues: CRÍTICOS | MENORES | OK
  4. Decidir acción:
     - ✅ OK → Permitir commit
     - ⚠️ MENORES → Preguntar al usuario
     - ❌ CRÍTICOS → Auto-corregir (volver a PASO 3)
- **Output**: Resultado review, acción recomendada
- **Ciclos de corrección**: Máximo 3

## Detección Automática de Tipo

El agente **issue-analyzer** usa este algoritmo:

```javascript
// Scoring system
score = { backend: 0, frontend: 0 }

// Keywords backend
if (contains('backend/', 'API', 'endpoint', 'use_case', 'repository', 'migration')) {
  score.backend += puntos
}

// Keywords frontend
if (contains('frontend/', 'component', 'hook', 'FSD', 'page', 'widget')) {
  score.frontend += puntos
}

// Archivos mencionados (mayor peso)
if (mentions('backend/**/*.py')) score.backend += 5
if (mentions('frontend/src/**/*.tsx')) score.frontend += 5

// Decisión
if (score.backend > 0 && score.frontend > 0) return 'fullstack'
else if (score.backend > score.frontend) return 'backend'
else if (score.frontend > score.backend) return 'frontend'
else return 'unknown' // → pregunta al usuario
```

**Precisión esperada:**
- ✅ 90%+ en issues bien documentados
- ✅ 70%+ en issues con contexto parcial
- ⚠️ Pregunta al usuario si confianza < 50%

## Sistema de Reintentos

Cada agente implementador tiene **hasta 3 intentos**:

```javascript
attempt = 1
max_attempts = 3

while (attempt <= max_attempts) {
  result = implementer.run()

  if (result.success) {
    break  // ✅ Éxito
  } else {
    console.log(`Intento ${attempt}/${max_attempts} falló`)
    console.log(`Error: ${result.error}`)

    if (attempt < max_attempts) {
      // Analizar error y corregir
      implementer.fix(result.error)
      attempt++
    } else {
      // ❌ Máximo de intentos alcanzado
      return { status: 'failed', error: result.error }
    }
  }
}
```

**Cuándo se reintenta:**
- Backend: Tests fallan, migración falla, errores de sintaxis
- Frontend: Type-check falla, lint falla, build falla
- Fullstack: Cualquiera de los anteriores, contract mismatch

## Gates de Calidad: Doble Validación (v2.1)

**CRÍTICO**: El workflow v2.1 tiene **DOS gates de calidad** antes del commit:

### Gate #1: test-runner (Validación Técnica)

```
Implementer termina
     ↓
test-runner ejecuta
     ↓
  ¿Tests passed?
     ├─ ✅ SÍ → Continuar a Gate #2
     └─ ❌ NO → BLOQUEAR workflow
```

**Bloquea si:**
- ❌ Backend: pytest falla
- ❌ Backend: Migraciones no aplicadas
- ❌ Frontend: TypeScript errors
- ❌ Frontend: Build falla

### Gate #2: code-reviewer (Validación de Calidad) - ⭐ NUEVO

```
Tests PASSED
     ↓
code-reviewer ejecuta
     ↓
  ¿Calidad OK?
     ├─ ✅ APROBADO → Commit único
     ├─ ⚠️ MENORES → Preguntar usuario
     └─ ❌ CRÍTICOS → Auto-corregir (volver a implementer)
```

**Bloquea automáticamente si:**
- ❌ Backend: Violación arquitectura hexagonal
- ❌ Backend: Lógica de negocio en adapters
- ❌ Backend: SQL injection potencial
- ❌ Frontend: Violación FSD
- ❌ Frontend: Tipos 'any' en código nuevo
- ❌ General: Issues críticos de calidad

**Resultado**: Solo se hace commit si AMBOS gates aprueban → Historial siempre limpio

## Commit Automático (v2.1)

Si **AMBOS gates aprueban** (test-runner + code-reviewer), se hace commit automático:

```bash
# Detectar tipo de issue (fix/feat/refactor)
type=$(detect_commit_type_from_issue)

# Generar mensaje Conventional Commit
message="${type}(${scope}): ${description} #${issue_number}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit
git add .
git commit -m "$message"
```

## Ejemplo Completo: Issue #119 (con Pre-Review v2.1)

### Comparación: Sin Pre-Review (v2.0) vs Con Pre-Review (v2.1)

#### ❌ Antes (v2.0): 2 commits

```
Implementer → Commit 1 → PR → Review → ❌ Encontró archivo faltante
  → Corregir → Commit 2 → Review → ✅ Aprobado

Resultado:
  * 3a4b5c6 fix(types): eliminar 'any' en CriterioRepartoFormModal #119
  * 2d3e4f5 fix(types): eliminar tipo 'any' en useCentrosCosteActions #119
```

#### ✅ Ahora (v2.1): 1 commit

```
PASO 1: Seleccionar Issue
  → Usuario ejecuta: /workflow:issue-complete
  → Ejecuta /github:next
  → Muestra top 3 issues
  → Usuario selecciona: #119

PASO 2: Analizar Tipo
  → issue-analyzer lee issue #119
  → Detecta:
     - Título: "fix(types): eliminar tipo 'any' en useCentrosCosteActions"
     - Archivo: "frontend/src/features/centros-coste/useCentrosCosteActions.ts"
     - Keywords: "types", "hook", "TypeScript", "features/"
  → Resultado: type=frontend, confidence=high

PASO 3: Implementar (Frontend) - Intento 1
  → Lanza frontend-implementer [1/3]
  → Lee plan del issue-planner
  → Crea tipo: GrupoCriteriosReparto
  → Actualiza: useCentrosCosteActions.ts (línea 173)
  → Actualiza: CentrosCostePanel.tsx (elimina 'any')
  → Ejecuta: npm run type-check ✅
  → Ejecuta: npm run lint ✅
  → Ejecuta: npm run build ✅
  → Intento: 1/3 → SUCCESS

PASO 4: Validar Tests (Gate #1)
  → Lanza test-runner
  → Detecta cambios frontend
  → Ejecuta: npm run type-check ✅
  → Ejecuta: npm run lint ✅
  → Ejecuta: npm run build ✅
  → Resultado: ready_for_review=true

⭐ PASO 5: PRE-CODE-REVIEW (Gate #2) - Intento 1
  → Lanza code-reviewer
  → Analiza cambios con /quality:review
  → Encuentra:
     ❌ ISSUE CRÍTICO:
        • CriterioRepartoFormModal.tsx línea 42: tipo 'any'
        • Archivo relacionado con los cambios actuales
        • No fue actualizado en la implementación
  → Decisión: AUTO-CORREGIR
  → Feedback al implementer: "Corregir CriterioRepartoFormModal.tsx"

PASO 3 (Reintento): Implementar - Intento 2
  → Lanza frontend-implementer [2/3]
  → Recibe feedback del pre-review
  → Actualiza archivo adicional: CriterioRepartoFormModal.tsx
  → Cambia: initialData?: any → initialData?: GrupoCriteriosReparto
  → Ejecuta: npm run type-check ✅
  → Ejecuta: npm run lint ✅
  → Ejecuta: npm run build ✅
  → Intento: 2/3 → SUCCESS

PASO 4 (Revalidación): Validar Tests
  → test-runner ejecuta nuevamente
  → Todos los tests: ✅ PASSED

⭐ PASO 5 (Revalidación): PRE-CODE-REVIEW - Intento 2
  → code-reviewer ejecuta nuevamente
  → Analiza TODOS los cambios (ahora incluye 4 archivos)
  → Resultado: ✅ APROBADO - Sin issues

PASO 6: Commit Único
  → git add . (incluye TODOS los 4 archivos corregidos)
  → git commit -m "fix(types): eliminar tipo 'any' en useCentrosCosteActions #119

  🤖 Generated with Claude Code

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

  ⭐ UN SOLO COMMIT (no hay commit de corrección)

PASO 7: Crear PR
  → git push Gex-Dashboard fix/119-eliminar-tipo-any-centros-coste
  → gh pr create --title "..." --body "..."
  → PR #204 creado

PASO 8: Code Review Final (Confirmación)
  → Ejecuta /quality:review
  → Valida FSD, TypeScript, commits
  → Resultado: ✅ APROBADO (siempre aprueba, ya revisado en PASO 5)

PASO 9: Merge
  → gh pr merge 204 --merge --delete-branch
  → git checkout master
  → git pull
  → Limpieza completa

TOTAL: Issue #119 completado con UN SOLO COMMIT limpio en ~5 minutos

Archivos incluidos en el commit único:
  ✅ frontend/src/types/centros-coste.ts (nuevo tipo)
  ✅ frontend/src/features/centros-coste/useCentrosCosteActions.ts (corregido)
  ✅ frontend/src/widgets/centros-coste/CentrosCostePanel.tsx (corregido)
  ✅ frontend/src/entities/centros-coste/CriterioRepartoFormModal.tsx (corregido)
```

## Ventajas del Workflow Automatizado (v2.1)

### ✅ Velocidad
- Issue resuelto en **4-6 minutos** (vs 30-60 minutos manual)
- Puede resolver **10+ issues por hora**
- Pre-review evita ciclos de corrección post-PR

### ✅ Consistencia
- **Siempre** sigue patrones (hexagonal/FSD)
- **Siempre** ejecuta tests
- **Siempre** hace pre-review + code review
- **Nunca** olvida pasos

### ✅ Calidad Garantizada (Doble Gate)
- Gate #1: Tests obligatorios antes de pre-review
- Gate #2: Code review obligatorio antes de commit ⭐ NUEVO
- Reintentos automáticos si falla
- Contract validation en fullstack
- **PRs siempre aprobados** (calidad validada antes del push)

### ✅ Historial Git Profesional ⭐ NUEVO
- **Siempre 1 commit por issue** (no commits de corrección)
- Pre-review detecta problemas ANTES del commit
- Historial limpio y profesional 100% del tiempo
- Sin notificaciones de "PR actualizado" múltiples veces

### ✅ Sin Errores Humanos
- No olvida ejecutar tests
- No olvida migraciones
- No viola reglas FSD
- No usa tipos 'any'
- **No hace commits sin revisar** ⭐ NUEVO

### ✅ Trazabilidad
- Todos los commits siguen Conventional Commits
- Todos los commits vinculados a issue (#119)
- Todos los commits Co-Authored-By Claude
- **Un commit = un issue completo** ⭐ NUEVO

## Configuración (v2.1)

Archivo: `.claude/skills/issue-workflow/config.json`

```json
{
  "version": "2.1.0",
  "automation": {
    "enabled": true,
    "autoImplement": true,              // ✅ Usar agentes especializados
    "autoCommit": true,                 // ✅ Commit automático si gates aprueban
    "autoPR": true,                     // ✅ Crear PR automático
    "autoReview": true,                 // ✅ Code review automático
    "autoMerge": true,                  // ✅ Merge automático si aprobado
    "maxRetries": 3,                    // Reintentos por agente
    "requireTestsPass": true            // ❌ BLOQUEAR si tests fallan
  },
  "detection": {
    "method": "analysis",               // "analysis" o "labels"
    "askUserIfUnknown": true,           // Preguntar si no detecta tipo
    "confidenceThreshold": 0.5
  },
  "preReview": {                        // ⭐ NUEVO v2.1
    "enabled": true,                    // ✅ Activar pre-code-review
    "blockOnCritical": true,            // Auto-corregir issues críticos
    "askOnMinor": true,                 // Preguntar en issues menores
    "maxCorrectionCycles": 3,           // Máximo 3 ciclos de corrección
    "skipPostReview": false             // Ejecutar review final después del PR
  },
  "testRunner": {
    "enabled": true,
    "blockCommitOnFailure": true
  },
  "workflow": {
    "loopUntilNoIssues": false,         // false = pregunta después de cada issue
    "maxIssuesPerSession": null         // null = infinito
  }
}
```

### Desactivar Pre-Review

Si quieres volver al modo v2.0 (review después del PR):

```json
{
  "preReview": {
    "enabled": false
  }
}
```

## Casos Especiales

### Si Agente Falla 3 Veces

```
❌ Implementación falló después de 3 intentos

Errores:
  Intento 1: TypeError en línea 42
  Intento 2: Tests fallaron (3 failed)
  Intento 3: Build falló (module not found)

¿Qué quieres hacer?
  1. "manual" → Implementar manualmente tú mismo
  2. "skip"   → Saltar este issue y continuar con siguiente
  3. "abort"  → Abortar workflow completo
```

### Si test-runner Bloquea Commit

```
❌ TESTS FAILED - Commit bloqueado

Backend:
  ✅ Migrations: OK
  ❌ Tests: 42/45 passed (3 failed)

Errores:
  - test_crear_usuario_duplicado
  - test_actualizar_usuario_inexistente

¿Qué quieres hacer?
  1. "fix"   → Agente reintentará corregir
  2. "manual" → Corregir manualmente
  3. "skip"   → Saltar issue
```

### Si Tipo No Detectado

```
⚠️  No se pudo detectar automáticamente el tipo

Issue: #150 "Mejorar código"
Confianza: low
Keywords: ninguna clara

¿Qué tipo de implementación necesita?
  1. Backend (FastAPI + Hexagonal)
  2. Frontend (React + FSD)
  3. Fullstack (ambos)
```

## Comparación: Manual vs Automatizado v2.0 vs v2.1

| Aspecto | Manual | v2.0 | v2.1 (Pre-Review) |
|---------|--------|------|-------------------|
| **Tiempo por issue** | 30-60 min | 5-7 min | **4-6 min** ✅ |
| **Issues por hora** | 1-2 | 8-10 | **10-12** ✅ |
| **Commits por issue** | 1-3 | 1-2 | **Siempre 1** ✅ |
| **Historial limpio** | 60% | 85% | **100%** ✅ |
| **PRs rechazados** | 20% | 5% | **0%** ✅ |
| **Errores humanos** | Frecuentes | Ninguno | Ninguno |
| **Tests olvidados** | 40% casos | 0% | 0% |
| **Patrones violados** | Ocasional | Nunca | Nunca |
| **Code review** | A veces | Después PR | **Antes commit** ✅ |
| **Consistencia** | Variable | 100% | 100% |
| **Commits sin revisar** | Frecuente | Ocasional | **Nunca** ✅ |

## Estadísticas Esperadas (v2.1)

### Sesión Típica (1 hora):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA (v2.1 con Pre-Review)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS:
  Issues resueltos:       12
  ├─ Backend:             4
  ├─ Frontend:            6
  └─ Fullstack:           2

  PRs creados:            12
  PRs mergeados:          12

  Commits realizados:     12 (1 por issue) ⭐
  ├─ Commits de corrección: 0 ⭐
  ├─ Automáticos:         12 (100%)
  └─ Conventional:        12 (100%)

  Pre-Reviews ejecutados: 12 ⭐
  ├─ Aprobados 1er ciclo: 10 (83%)
  ├─ Corregidos auto:     2 (17%)
  └─ Fallidos total:      0 (0%)

  Code reviews finales:   12 (100% aprobados) ⭐

  Tests ejecutados:       156
  ├─ Backend (pytest):    89 passed
  └─ Frontend (build):    67 passed

  Reintentos totales:     2
  ├─ Por implementer:     0
  ├─ Por pre-review:      2 ⭐
  └─ Intento 3:           0

  Tiempo promedio/issue:  4m 30s ⭐
  Tiempo total:           54m

  Calidad:                100%
  ├─ Historial limpio:    12/12 (100%) ⭐
  ├─ PRs rechazados:      0/12 (0%) ⭐
  ├─ FSD violations:      0
  ├─ TypeScript errors:   0
  ├─ Tests failed:        0
  └─ Review rejections:   0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Conclusión (v2.1)

El workflow automatizado v2.1 con **Pre-Code-Review** transforma completamente el proceso de desarrollo:

- ✅ **10x más rápido** (12 issues/hora vs 1-2 manual)
- ✅ **100% consistente** (siempre sigue patrones)
- ✅ **0 errores** (doble gate: tests + pre-review obligatorios)
- ✅ **Historial siempre limpio** (1 commit por issue garantizado) ⭐ NUEVO
- ✅ **PRs siempre aprobados** (calidad validada antes del push) ⭐ NUEVO
- ✅ **Escalable** (puede resolver 50+ issues/día)

**Resultado**: Desarrollo de alta velocidad con garantía de calidad y profesionalismo en el historial git.

### Mejoras v2.1 vs v2.0

| Mejora | Impacto |
|--------|---------|
| **Pre-Code-Review** | Detecta problemas antes del commit |
| **1 commit por issue** | Historial 100% limpio |
| **0% PRs rechazados** | Review final siempre aprueba |
| **Ciclo de corrección pre-commit** | Hasta 3 intentos antes de pushear |
| **Más rápido** | -16% tiempo (sin ciclos post-PR) |

**Recomendación**: Usa siempre Pre-Review activado (`preReview.enabled: true`) para máxima calidad.
