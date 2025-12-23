---
description: Revisar automáticamente todos los issues en Done de un proyecto, crear issues por errores, y mover a Reviewed solo los que pasan QA
allowed-tools: Task, Read, Glob, Grep, Bash(gh *), Bash(git *), Bash(npx *), Bash(node *), Write, mcp__playwright__browser_navigate, mcp__playwright__browser_click, mcp__playwright__browser_snapshot, mcp__playwright__browser_console_messages, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_evaluate, mcp__playwright__browser_network_requests
---

# QA Review Done - Automated Issue Verification with Auto-Issue Creation

El usuario quiere revisar automáticamente todos los issues en columna "Done" de un proyecto GitHub y crear issues automáticamente por cada error detectado. Argumentos: $ARGUMENTS

## Propósito

Este comando automatiza el proceso de QA verificando EXHAUSTIVAMENTE cada issue en Done con Playwright MCP, y **creando issues automáticamente** por cada error detectado para cerrar el ciclo de feedback.

**Resultado:** Issues solo pasan a "Reviewed" cuando tienen 0 errores. Los errores detectados se convierten automáticamente en issues rastreables.

---

## Sintaxis

```bash
/qa:review-done --project=<numero> [opciones]
```

**Argumentos:**
- `--project=<numero>` - Número del proyecto GitHub (REQUERIDO)
- `--skip-browser` - Omitir verificación en navegador (solo TypeScript y archivos)
- `--dry-run` - Simular sin mover issues ni crear issues de errores

**Ejemplos:**
```bash
# Uso básico
/qa:review-done --project=7

# Solo verificar TypeScript y archivos (más rápido)
/qa:review-done --project=7 --skip-browser

# Dry run (simular sin cambios)
/qa:review-done --project=7 --dry-run
```

---

## Instrucciones de Ejecución

### PASO 1: Validar Argumentos

```javascript
// Extraer numero de proyecto
const projectMatch = $ARGUMENTS.match(/--project=(\d+)/);
if (!projectMatch) {
  console.log('❌ Error: Debes especificar --project=<numero>')
  console.log('Ejemplo: /qa:review-done --project=7')

  // Listar proyectos disponibles
  const projects = await Bash('gh project list --owner {{githubOwner}} --format json')
  console.log('\nProyectos disponibles:')
  JSON.parse(projects).forEach(p => {
    console.log(`  #${p.number} - ${p.title}`)
  })

  return
}

const projectNumber = projectMatch[1]
const skipBrowser = $ARGUMENTS.includes('--skip-browser')
const dryRun = $ARGUMENTS.includes('--dry-run')

console.log(`Starting QA Review for Project #${projectNumber}`)
if (skipBrowser) console.log('⚠️  Skipping browser verification')
if (dryRun) console.log('⚠️  DRY RUN - No changes will be made')
```

### PASO 2: Invocar Skill qa-review-done

```javascript
// El skill ejecuta:
// - Obtener todos los issues en columna "Done"
// - Para cada issue:
//   1. Verificar archivos existen
//   2. Compilar TypeScript (frontend)
//   3. Verificaciones EXHAUSTIVAS con Playwright:
//      - Console messages (ALL levels: error, warning, info, log)
//      - Network requests (GET, POST, PUT, DELETE con análisis completo)
//      - Interacciones de usuario (click, form fill, submit)
//      - Performance (load time, API response time, memory)
//      - Estado de aplicación (React Query, localStorage, sessionStorage)
//   4. **CREAR ISSUE AUTOMÁTICAMENTE** por cada error detectado usando /github:issue
//   5. **COMENTAR EN ISSUE ORIGINAL** con enlaces a issues creados
//   6. **MOVER A REVIEWED** solo si 0 errores detectados

await Skill('qa-review-done', {
  projectNumber: projectNumber,
  skipBrowser: skipBrowser,
  dryRun: dryRun
})
```

---

## Verificaciones Ejecutadas

Para cada issue en "Done", el skill verifica:

### ✅ Verificación de Archivos
- Archivos mencionados en el issue existen
- No hay imports rotos
- Estructura correcta según FSD (frontend) o Hexagonal (backend)

**Si falla:** Crea issue `[QA] Missing files en #N`

### ✅ Compilación TypeScript (Frontend)
```bash
cd frontend
npx tsc --noEmit
```
- PASS: Sin errores de compilación
- FAIL: Errores de tipos → **Crea issue `[QA] TypeScript compilation error en #N`**

### ✅ Verificación Browser - Console EXHAUSTIVA
```javascript
// Capturar TODOS los console messages
const consoleMessages = await mcp__playwright__browser_console_messages()

// Clasificar por severidad:
// - CRITICAL: Uncaught errors, TypeError, ReferenceError, failed fetch
// - HIGH: React warnings, deprecations
// - MEDIUM: Third-party warnings
// - LOW: Info logs
```

**Si falla:** Crea issue `[QA] Console error en #N: {error_summary}`

### ✅ Verificación Browser - Network EXHAUSTIVA
```javascript
// Capturar TODAS las network requests
const networkRequests = await mcp__playwright__browser_network_requests()

// Analizar cada POST/PUT/DELETE:
// - Status code debe ser 2xx
// - Response body debe ser JSON válido
// - No debe contener errores en response
// - Tiempo de respuesta <3s (warning si >3s, fail si >5s)
// - No CORS errors
// - No Auth errors (401/403)
```

**Errores detectados automáticamente:**
- **API Error 500** → Crea issue `[QA] API Error 500 en #N: POST /api/v1/usuarios`
- **CORS Error** → Crea issue `[QA] CORS error en #N`
- **Validation 422** → Crea issue `[QA] Validation error en #N`
- **Backend Down** → Crea issue `[QA] Backend not running en #N`
- **Slow API >5s** → Crea issue `[QA] Performance issue en #N: Slow API response`

### ✅ Verificación Browser - Interacciones Usuario
```javascript
// Identificar acciones del issue (ej: "crear usuario")
// Simular flujo completo:
// 1. Click en botón "Nuevo Usuario" → Screenshot
// 2. Llenar formulario con datos de prueba → Screenshot
// 3. Submit formulario → Capturar network
// 4. Verificar success message (toast/alert)
// 5. Verificar redirección correcta

// Capturar errores durante cada acción
```

**Si falla:** Crea issue `[QA] Interaction error en #N: Error after clicking Submit`

### ✅ Verificación Browser - Performance & Estado
```javascript
// Performance:
// - Tiempo de carga página <3s
// - Response time APIs <3s
// - Memory usage razonable

// Estado de aplicación:
// - React Query: No queries con errores
// - localStorage: Auth token existe si se requiere
// - sessionStorage: Datos críticos presentes
```

**Si falla:** Crea issue `[QA] Performance issue en #N: Slow page load 5230ms`

---

## Creación Automática de Issues

Cuando se detecta un error, el skill **crea automáticamente un issue** usando `/github:issue`:

**Estructura del issue creado:**
```markdown
Title: [QA] {tipo_error} en #{issue_original}: {descripción}

Body:
## Issue Original Bloqueado
#{issue_original} - {titulo}

Este issue no puede moverse a Reviewed por el siguiente error.

## Error Detectado
**Tipo:** {errorType}
**Severidad:** CRITICAL/HIGH/MEDIUM

{detalles_del_error}

## Screenshot
![Error Screenshot](.claude/qa-screenshots/issue-{N}-errors.png)

## Request (si aplica)
```json
{request_body}
```

## Response (si aplica)
```json
{response_body}
```

## Impacto
- Severidad: CRITICAL
- Bloquea: #{issue_original}
- {descripción_impacto}

## Acción Requerida
{pasos_para_resolver}

---
🤖 Auto-created by QA Review
```

**Labels aplicados:**
- `bug` - Es un bug detectado por QA
- `qa-failed` - Bloqueante de QA
- `auto-created` - Creado automáticamente
- `severity:critical|high|medium` - Nivel de severidad
- `{error-type}` - Tipo específico: `api-error`, `console-error`, `typescript`, `cors-error`, etc.

**Asignación:**
- Asignado a: Mismos assignees del issue original
- Proyecto: Agregado al mismo proyecto
- Linked to: Issue original (#N)

---

## Comentario en Issue Original

Cuando se detectan errores, el skill agrega un comentario al issue original:

```markdown
## ⚠️ QA Review Failed

Este issue no puede moverse a Reviewed por los siguientes errores detectados.

### Errores Detectados (3)
- 🔴 [API_ERROR] #234 - API Error 500 POST /api/v1/usuarios - Severity: CRITICAL
- 🔴 [CONSOLE_ERROR] #235 - Console error: Cannot read property 'map' - Severity: HIGH
- 🟡 [PERFORMANCE] #236 - Slow page load: 5230ms - Severity: MEDIUM

### Próximos Pasos
1. Resolver todos los issues creados arriba
2. Volver a ejecutar `/qa:review-done --project=7`
3. Si todos los issues están resueltos, este issue se moverá automáticamente a Reviewed

---
🤖 Auto-generated by QA Review - 2025-12-23 15:30:45
```

---

## Agrupación Inteligente de Errores

Si múltiples issues tienen el **mismo error** (ej: mismo API endpoint retorna 500), el skill agrupa automáticamente:

```markdown
Title: [QA] API Error 500 POST /api/v1/usuarios - Affects 3 issues

Body:
## Issues Afectados
- #210 - Crear usuarios
- #211 - Editar usuarios
- #212 - Eliminar usuarios

## Error Común
POST /api/v1/usuarios → 500 Internal Server Error
Response: {"detail": "Database connection timeout"}

## Impacto
- Severidad: CRITICAL
- Bloquea 3 issues en Done

## Acción Requerida
Resolver este error desbloqueará todos los issues afectados.
Verificar conexión a base de datos y revisar logs del backend.
```

---

## Output Final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QA REVIEW COMPLETE - Project #7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Approved → Reviewed:     12 issues
❌ Failed → Stay in Done:    3 issues
🐛 Issues Created:           8 issues

Failed Issues:
  #210 → 3 errors → 3 issues created
    - [API_ERROR] #234 - API Error 500 POST /api/v1/usuarios
    - [CONSOLE_ERROR] #235 - Console error: Cannot read property 'map'
    - [PERFORMANCE] #236 - Slow page load: 5230ms

  #211 → 2 errors → 2 issues created (1 grouped)
    - [API_ERROR] #234 (grouped with #210)
    - [TYPESCRIPT_ERROR] #237 - TypeScript compilation error

  #216 → 3 errors → 3 issues created
    - [CORS_ERROR] #238 - CORS error blocking requests
    - [CONSOLE_ERROR] #239 - Uncaught TypeError in UserForm.tsx
    - [INTERACTION_ERROR] #240 - Error after clicking "Submit"

⏱️  Time: 12 min 45 sec

Next Steps:
  1. Resolve the 8 issues created (see project board)
  2. Re-run: /qa:review-done --project=7
  3. Issues will auto-move to Reviewed when all checks pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Casos Especiales

### Sin Issues en Done

```
ℹ️  NO ISSUES TO REVIEW

Proyecto #7: No hay issues en columna "Done"
✅ Nada que revisar
```

### Todos Aprobados

```
✅ ALL ISSUES APPROVED

15/15 issues pasaron QA
🎉 Todos movidos a Reviewed

⏱️  Time: 8 min 23 sec
```

### Backend No Está Corriendo

Si el backend no responde, crea UN solo issue agrupado:

```
Title: [QA] Backend not running - Affects ALL frontend issues

Body:
## Issues Afectados
- #210, #211, #212, #213, #214 (5 issues bloqueados)

## Error
Backend server is not accessible at http://localhost:8000
All API requests fail with ECONNREFUSED

## Acción Requerida
1. Iniciar el servidor backend: `docker-compose up -d backend`
2. Verificar que está corriendo: `curl http://localhost:8000/health`
3. Re-ejecutar QA review: `/qa:review-done --project=7`
```

---

## Integración con Workflow

Este comando se ejecuta típicamente:

```
DESARROLLO
  ↓
Issues marcados como "Done" manualmente
  ↓
🔍 /qa:review-done --project=7  ← ESTE COMANDO
  ↓
  ¿Todos aprobados?
  ├─ ✅ SÍ → Movidos a "Reviewed"
  │         └─ Listos para merge
  │
  └─ ❌ NO → Issues creados automáticamente
            ├─ Comentario en issue original
            ├─ Issues con bugs agregados al proyecto
            └─ Se quedan en "Done"
  ↓
Resolver issues de bugs (automáticos o manuales)
  ↓
Re-ejecutar /qa:review-done --project=7
  ↓
✅ Si todos pasan → Movidos a "Reviewed"
```

---

## Notas Importantes

1. **Auto-creación de issues** - SIEMPRE crea issue por cada error (cierra el loop de feedback)
2. **Evidencia completa** - Screenshots, logs, network traces en cada issue creado
3. **0 errores = Reviewed** - Solo mueve a Reviewed si NO hay errores detectados
4. **Comentarios automáticos** - Issue original recibe comentario con links a issues creados
5. **Agrupación inteligente** - Errores duplicados se agrupan en un solo issue
6. **Playwright exhaustivo** - Verificaciones COMPLETAS de console, network, interacciones, performance
7. **No reportes ni emails** - Resultado se ve directamente en issues creados y project board

---

## Troubleshooting

### Error: "Project not found"
```bash
# Verificar numero de proyecto correcto
gh project list --owner {{githubOwner}}

# Usar el número correcto
/qa:review-done --project=7
```

### Error: "Frontend server not running"
```bash
# Iniciar servidor desarrollo
cd frontend
npm run dev

# Esperar a que esté listo (http://localhost:3000)
# Luego ejecutar: /qa:review-done --project=7
```

### Muchos issues creados (>20)
Esto indica problemas sistémicos. Opciones:
1. Revisar y corregir errores agrupados primero (backend down, CORS, etc.)
2. Ejecutar con `--skip-browser` para identificar solo errores TypeScript
3. Ejecutar con `--dry-run` primero para ver cuántos errores hay sin crear issues

---

## Ver También

- `/quality:review` - Revisar código antes de commit
- `/github:issue` - Crear issue manualmente
- Skill `qa-review-done` - Documentación completa del skill
