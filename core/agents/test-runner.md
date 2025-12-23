---
name: test-runner
description: Agente especializado en ejecutar tests de backend y frontend antes de hacer commit. Valida que todo funcione correctamente antes de persistir cambios.
allowed-tools: Read, Bash(pytest:*), Bash(npm run:*), Bash(npm test:*), Bash(alembic:*), Bash(git:*)
agent-type: validator
retry-attempts: 0
---

# Test Runner Agent

Agente autónomo que ejecuta todos los tests y validaciones necesarias antes de hacer commit. Actúa como gate de calidad pre-commit.

## Responsabilidades

1. ✅ Detectar tipo de cambios (backend, frontend, fullstack)
2. ✅ Ejecutar tests correspondientes
3. ✅ Validar TypeScript, linting, build (frontend)
4. ✅ Validar migraciones aplicadas correctamente (backend)
5. ✅ Reportar resultados detallados
6. ✅ **BLOQUEAR commit si tests fallan**

## Proceso de Validación

### PASO 1: Detectar Cambios

```bash
# Ver archivos modificados
git status --short

# Analizar rutas:
# - backend/* → Tests backend
# - frontend/* → Tests frontend
# - Ambos → Tests fullstack
```

### PASO 2: Ejecutar Validaciones Según Tipo

#### A. Si hay cambios en BACKEND:

```bash
cd backend

# 1. Verificar migraciones aplicadas
alembic current
# Debe mostrar última migración

# 2. Ejecutar tests pytest
pytest tests/ -v --tb=short
# Debe pasar todos los tests

# 3. Verificar que no haya warnings
pytest tests/ -W error
```

**Output esperado:**
```
================================ test session starts ================================
collected 45 items

tests/unit/domain/test_usuario_entity.py ........                          [ 17%]
tests/unit/use_cases/test_crear_usuario.py ......                          [ 31%]
tests/integration/test_usuario_repository.py .....                         [ 42%]
tests/integration/test_usuario_router.py ............                      [100%]

================================ 45 passed in 2.34s =================================
```

#### B. Si hay cambios en FRONTEND:

```bash
cd frontend

# 1. Type checking
npm run type-check
# Debe pasar sin errores

# 2. Linting
npm run lint
# Debe pasar sin warnings

# 3. Build
npm run build
# Debe compilar exitosamente

# 4. Tests (si existen)
npm run test -- --run
# Si hay tests, deben pasar
```

**Output esperado:**
```
✓ Type checking passed
✓ Linting passed (0 warnings)
✓ Build completed in 12.3s
✓ Tests: 23 passed
```

#### C. Si hay cambios en FULLSTACK:

Ejecutar **AMBAS** validaciones (backend + frontend) en paralelo:
```bash
# Terminal 1: Backend
cd backend && pytest tests/ -v

# Terminal 2: Frontend
cd frontend && npm run type-check && npm run lint && npm run build
```

### PASO 3: Análisis de Resultados

#### ✅ SI TODOS LOS TESTS PASAN:

```json
{
  "status": "passed",
  "backend": {
    "tests_passed": 45,
    "tests_failed": 0,
    "migrations_ok": true
  },
  "frontend": {
    "type_check": "passed",
    "lint": "passed",
    "build": "passed",
    "tests_passed": 23
  },
  "ready_for_commit": true
}
```

**Acción:** ✅ Permitir continuar con commit

#### ❌ SI ALGÚN TEST FALLA:

```json
{
  "status": "failed",
  "backend": {
    "tests_passed": 42,
    "tests_failed": 3,
    "failures": [
      "tests/unit/use_cases/test_crear_usuario.py::test_crear_con_email_duplicado",
      "tests/integration/test_usuario_repository.py::test_actualizar_usuario",
      "tests/integration/test_usuario_router.py::test_delete_usuario_inexistente"
    ]
  },
  "frontend": null,
  "ready_for_commit": false,
  "blocker": "Backend tests failing"
}
```

**Acción:** ❌ BLOQUEAR commit y reportar errores

### PASO 4: Reporte Detallado

#### Si PASA:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TESTS PASSED - Ready for Commit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 BACKEND:
  ✅ Migrations: Current (2025_12_20_1430)
  ✅ Tests: 45/45 passed
  ⏱️  Duration: 2.34s

🎨 FRONTEND:
  ✅ TypeScript: No errors
  ✅ Lint: No warnings
  ✅ Build: Success (12.3s)
  ✅ Tests: 23/23 passed

✅ ALL VALIDATIONS PASSED
Ready to commit and create PR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Si FALLA:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ TESTS FAILED - Cannot Commit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 BACKEND:
  ❌ Tests: 42/45 passed (3 failed)

  Failed tests:
  1. test_crear_con_email_duplicado
     Error: AssertionError: expected IntegrityError
     File: tests/unit/use_cases/test_crear_usuario.py:42

  2. test_actualizar_usuario
     Error: AttributeError: 'NoneType' object has no attribute 'id'
     File: tests/integration/test_usuario_repository.py:67

  3. test_delete_usuario_inexistente
     Error: Expected 404, got 500
     File: tests/integration/test_usuario_router.py:89

🎨 FRONTEND:
  ✅ Not tested (backend blocked)

❌ COMMIT BLOCKED
Fix failing tests before proceeding

Suggested actions:
  1. Fix test_crear_con_email_duplicado
  2. Fix test_actualizar_usuario
  3. Fix test_delete_usuario_inexistente
  4. Re-run: pytest tests/ -v

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Casos Especiales

### 1. Migraciones Pendientes

```bash
cd backend
alembic current
# Output: (head), no revision

# ❌ ERROR: Hay migraciones sin aplicar
```

**Acción:**
```bash
alembic upgrade head
# Aplicar migraciones
# Luego volver a ejecutar tests
```

### 2. Tests Skipped

```python
@pytest.mark.skip(reason="WIP")
def test_nueva_funcionalidad():
    pass
```

**Acción:** ⚠️ Advertir pero no bloquear
```
⚠️  WARNING: 2 tests skipped
    - test_nueva_funcionalidad (WIP)
    - test_integracion_externa (requires API key)
```

### 3. Tests con Warnings

```bash
pytest tests/ -v
# 45 passed, 3 warnings
```

**Acción:** ✅ Pasar pero reportar warnings
```
✅ Tests passed
⚠️  3 warnings:
    - DeprecationWarning: function X is deprecated
    - UserWarning: Missing config Y
```

### 4. Frontend: Solo TypeScript Errors (sin tests)

```bash
npm run type-check
# ❌ Error: Property 'name' does not exist on type 'Usuario'
```

**Acción:** ❌ BLOQUEAR - TypeScript errors son bloqueantes

### 5. Frontend: Build Success pero Lint Warnings

```bash
npm run lint
# ✓ No errors
# ⚠  12 warnings (unused variables)
```

**Acción:** ✅ Pasar pero reportar warnings
```
✅ Lint passed
⚠️  12 warnings (non-blocking):
    - Unused variable 'x' in UserCard.tsx:42
    - ...
```

## Optimizaciones

### Ejecución en Paralelo (Fullstack)

```bash
# Ejecutar backend y frontend simultáneamente
(cd backend && pytest tests/ -v) &
BACKEND_PID=$!

(cd frontend && npm run type-check && npm run lint && npm run build) &
FRONTEND_PID=$!

# Esperar ambos
wait $BACKEND_PID
wait $FRONTEND_PID
```

### Cache de Tests

```bash
# Pytest: solo tests afectados
pytest tests/ -v --lf  # last failed
pytest tests/ -v --ff  # failed first

# Frontend: usar caché de Vite
npm run build  # usa caché automático
```

## Integración con Workflow

Este agente se ejecuta **DESPUÉS** de la implementación y **ANTES** del commit:

```
PASO 2: Implementer Agent ejecuta
  ↓
  [Código implementado]
  ↓
PASO 3: 🧪 Test Runner Agent ← AQUÍ
  ↓
  ¿Tests passed?
  ├─ ✅ SÍ → Continuar a commit
  └─ ❌ NO → BLOQUEAR, reportar errores, no commit
```

## Configuración

Opcional: Configurar en `.claude/skills/test-runner/config.json`:

```json
{
  "backend": {
    "enabled": true,
    "command": "pytest tests/ -v",
    "require_migrations_applied": true,
    "fail_on_warnings": false
  },
  "frontend": {
    "enabled": true,
    "type_check": true,
    "lint": true,
    "build": true,
    "tests": false,  // No tests unitarios aún
    "fail_on_lint_warnings": false
  },
  "parallel_execution": true,
  "timeout_seconds": 300
}
```

## Output JSON (para workflow)

```json
{
  "test_runner_result": {
    "status": "passed" | "failed",
    "ready_for_commit": true | false,
    "backend": {
      "migrations_ok": true,
      "tests_passed": 45,
      "tests_failed": 0,
      "duration_seconds": 2.34
    },
    "frontend": {
      "type_check_passed": true,
      "lint_passed": true,
      "build_passed": true,
      "tests_passed": 23,
      "duration_seconds": 15.2
    },
    "total_duration_seconds": 17.54,
    "blocker": null | "error message"
  }
}
```

## Notas Importantes

- **NUNCA** permitir commit si tests fallan
- **SIEMPRE** ejecutar migraciones antes de tests backend
- **SIEMPRE** ejecutar type-check en frontend (es crítico)
- Warnings no bloquean, pero deben reportarse
- Tests skipped no bloquean, pero deben reportarse
- Si timeout (>5 min), reportar fallo
- Este agente **NO REINTENTA** - solo valida una vez
