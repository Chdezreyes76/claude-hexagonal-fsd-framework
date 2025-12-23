---
name: qa-review-done
description: Revisar automáticamente todos los issues en Done de un proyecto, crear issues por errores detectados, y mover a Reviewed solo los que pasan todas las verificaciones
agent-type: qa-validator
retry-attempts: 0
execution-mode: autonomous
auto-approve: read-only

# Tool Categories
allowed-tools: |
  # File Operations - Read
  Read, Glob, Grep,

  # Bash - Read Only Operations
  Bash(ls *), Bash(dir *), Bash(cat *), Bash(type *), Bash(head *), Bash(tail *), Bash(find *), Bash(grep *), Bash(rg *), Bash(pwd *), Bash(cd *),

  # Git - Read Only
  Bash(git status *), Bash(git log *), Bash(git diff *), Bash(git show *), Bash(git branch *),

  # GitHub CLI - Read & Write
  Bash(gh issue view *), Bash(gh issue list *), Bash(gh issue create *), Bash(gh issue comment *), Bash(gh issue edit *),
  Bash(gh pr view *), Bash(gh pr list *),
  Bash(gh project view *), Bash(gh project list *), Bash(gh project item-list *),
  Bash(gh api graphql *),

  # TypeScript & Node - Read Only
  Bash(npx tsc --noEmit *), Bash(npx tsc *), Bash(node --version *), Bash(npm list *),

  # Python - Read Only
  Bash(python --version *), Bash(python -c *), Bash(pytest --collect-only *),

  # File Operations - Write (for screenshots)
  Write,

  # Playwright MCP Tools
  mcp__playwright__browser_navigate,
  mcp__playwright__browser_click,
  mcp__playwright__browser_snapshot,
  mcp__playwright__browser_console_messages,
  mcp__playwright__browser_take_screenshot,
  mcp__playwright__browser_evaluate,
  mcp__playwright__browser_network_requests

# Commands that can be invoked
invokes-commands: |
  /github:issue
---

# QA Review Done - Automated Issue Verification with Auto-Issue Creation

Agente autónomo que revisa todos los issues en columna "Done", ejecuta verificaciones exhaustivas con Playwright, y **crea issues automáticamente por cada error detectado** para cerrar el ciclo de feedback.

## Uso

```bash
/qa:review-done --project=<numero>
# Ejemplo: /qa:review-done --project=7
```

## Responsabilidades Principales

1. ✅ Obtener todos los issues en columna "Done" del proyecto
2. ✅ Para cada issue:
   - Verificar archivos existen
   - Compilar TypeScript (frontend)
   - **Verificaciones exhaustivas en navegador con Playwright:**
     - Console messages (errors, warnings, logs)
     - Network requests completas (GET, POST, PUT, DELETE)
     - Interacciones de usuario (click, form submit, navigation)
     - Performance (load time, response time, memory)
     - Estado de aplicación (React state, Query cache, localStorage)
   - **Capturar evidencia (screenshots, logs, network traces)**
3. ✅ **Crear issue automáticamente por cada error detectado** usando `/github:issue`
4. ✅ **Comentar en issue original** con enlaces a issues creados
5. ✅ **Mover a "Reviewed" SOLO si 0 errores detectados**
6. ✅ Mostrar resumen final simplificado

## Flujo de Verificación por Issue

```
Para cada issue en "Done":
  ├─ TypeScript compile
  │  └─ ❌ Error → /github:issue "[QA] TypeScript error en #N" → Continue
  │
  ├─ Files exist
  │  └─ ❌ Missing → /github:issue "[QA] Missing files en #N" → Continue
  │
  ├─ Browser Verification (Playwright MCP)
  │  │
  │  ├─ CONSOLE EXHAUSTIVA
  │  │  ├─ Capturar ALL console messages (error, warning, info, log)
  │  │  ├─ Clasificar por severidad (CRITICAL, HIGH, MEDIUM, LOW)
  │  │  └─ ❌ CRITICAL/HIGH → /github:issue "[QA] Console error en #N"
  │  │
  │  ├─ NETWORK EXHAUSTIVA
  │  │  ├─ Capturar TODAS las requests (GET, POST, PUT, DELETE)
  │  │  ├─ Analizar cada request:
  │  │  │  ├─ Status code correcto (2xx)
  │  │  │  ├─ Response body válido (JSON parse OK)
  │  │  │  ├─ Headers correctos (Content-Type, CORS)
  │  │  │  ├─ Tiempo respuesta <3s
  │  │  │  └─ No CORS/Auth errors
  │  │  ├─ ❌ API Error 500 → /github:issue "[QA] API Error 500 en #N"
  │  │  ├─ ❌ CORS Error → /github:issue "[QA] CORS error en #N"
  │  │  └─ ❌ Validation 422 → /github:issue "[QA] Validation error en #N"
  │  │
  │  ├─ INTERACCIONES USUARIO
  │  │  ├─ Identificar acciones del issue (ej: "crear usuario")
  │  │  ├─ Simular flujo completo:
  │  │  │  ├─ Click en botón → Screenshot
  │  │  │  ├─ Llenar formulario → Screenshot
  │  │  │  ├─ Submit → Verificar success/error
  │  │  │  └─ Verificar redirección correcta
  │  │  ├─ Capturar console/network durante interacción
  │  │  └─ ❌ Error → /github:issue "[QA] Interaction error en #N"
  │  │
  │  ├─ PERFORMANCE & ESTADO
  │  │  ├─ Tiempo de carga página <3s
  │  │  ├─ Response time APIs <3s
  │  │  ├─ Verificar React state (no queries infinitas)
  │  │  ├─ Verificar localStorage/sessionStorage
  │  │  └─ ⚠️ Slow (>5s) → /github:issue "[QA] Performance issue en #N"
  │  │
  │  └─ SCREENSHOTS & EVIDENCIA
  │     ├─ Capturar screenshot inicial
  │     ├─ Capturar screenshot por acción
  │     └─ Guardar en issue creado
  │
  └─ RESULTADO FINAL:
     ├─ 0 errores → ✅ Move to "Reviewed"
     ├─ 1-3 errores → ❌ Stay in "Done" + N issues creados + Comment
     └─ >5 errores → ❌ Stay in "Done" + Issues agrupados + Comment
```

## PASO 1: Obtener Issues en Done

```bash
# Consultar GitHub GraphQL API para obtener issues en columna "Done"
gh api graphql -f query='
query($owner: String!, $repo: String!, $projectNumber: Int!) {
  repository(owner: $owner, name: $repo) {
    projectV2(number: $projectNumber) {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue {
              number
              title
              body
              url
            }
          }
          fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue {
              name
            }
          }
        }
      }
    }
  }
}' -f owner='{{githubOwner}}' -f repo='{{githubRepo}}' -F projectNumber=<numero>
```

**Filtrar solo issues con Status="Done":**
```javascript
const issuesInDone = response.data.repository.projectV2.items.nodes
  .filter(item => item.fieldValueByName?.name === "Done")
  .map(item => ({
    number: item.content.number,
    title: item.content.title,
    body: item.content.body,
    url: item.content.url,
    itemId: item.id
  }))
```

## PASO 2: Verificación Exhaustiva con Playwright

Para cada issue en Done:

### A. Análisis del Issue

```bash
gh issue view <numero> --json number,title,body,labels
```

Extraer información:
- Tipo de issue (backend/frontend/fullstack)
- Archivos mencionados
- Rutas/páginas afectadas
- Acciones esperadas (ej: "crear usuario", "editar producto")

### B. Verificar Archivos

```bash
# Verificar cada archivo mencionado en el issue
for file in ${files[@]}; do
  if [ ! -f "$file" ]; then
    echo "❌ File not found: $file"
    errors+=("Missing file: $file")
  fi
done
```

**Si hay archivos faltantes:**
```bash
/github:issue \
  --title "[QA] Missing files en #${issue_number}: ${issue_title}" \
  --body "## Issue Original Bloqueado
#${issue_number} - ${issue_title}

## Archivos Faltantes
${missing_files_list}

## Impacto
- Severidad: CRITICAL
- Bloquea: #${issue_number}

## Acción Requerida
Crear los archivos faltantes o actualizar referencias en el código." \
  --label "bug,qa-failed,auto-created,priority:high" \
  --linked-to "${issue_number}"
```

### C. Compilación TypeScript

```bash
cd frontend
npx tsc --noEmit 2>&1 | tee /tmp/tsc_errors_${issue_number}.log
```

**Si hay errores TypeScript:**
```bash
# Parsear errores y crear issue
tsc_errors=$(cat /tmp/tsc_errors_${issue_number}.log)

/github:issue \
  --title "[QA] TypeScript compilation error en #${issue_number}" \
  --body "## Issue Original Bloqueado
#${issue_number} - ${issue_title}

## Errores de Compilación TypeScript
\`\`\`
${tsc_errors}
\`\`\`

## Archivos Afectados
${affected_files}

## Impacto
- Severidad: CRITICAL
- Bloquea: #${issue_number}
- Rompe build de producción

## Acción Requerida
Corregir los errores de tipos antes de mover a Reviewed." \
  --label "bug,qa-failed,typescript,auto-created,priority:high"
```

### D. Verificación Browser - Console Exhaustiva

```javascript
// 1. Navegar a la aplicación
await mcp__playwright__browser_navigate({
  url: "http://localhost:3000"
})

// 2. Identificar rutas relevantes del issue
const routes = extractRoutesFromIssue(issueBody)
// Ejemplo: ["/settings", "/usuarios", "/usuarios/crear"]

for (const route of routes) {
  console.log(`Navigating to ${route}...`)

  // Navegar a la ruta
  await mcp__playwright__browser_navigate({
    url: `http://localhost:3000${route}`
  })

  // Esperar carga completa
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Capturar TODOS los mensajes de consola
  const consoleMessages = await mcp__playwright__browser_console_messages()

  // Clasificar por severidad
  const errors = consoleMessages.filter(m => m.type === 'error')
  const warnings = consoleMessages.filter(m => m.type === 'warning')

  // Analizar errores CRÍTICOS
  const criticalErrors = errors.filter(err =>
    err.text.includes('Uncaught') ||
    err.text.includes('TypeError') ||
    err.text.includes('ReferenceError') ||
    err.text.includes('failed to fetch') ||
    err.text.includes('Network request failed')
  )

  // Analizar errores HIGH (React warnings importantes)
  const highErrors = warnings.filter(warn =>
    warn.text.includes('Warning: Can\'t perform a React state update') ||
    warn.text.includes('Warning: Each child in a list should have a unique "key"') ||
    warn.text.includes('deprecated')
  )

  // Capturar screenshot si hay errores
  if (criticalErrors.length > 0 || highErrors.length > 0) {
    const screenshot = await mcp__playwright__browser_take_screenshot({
      path: `.claude/qa-screenshots/issue-${issueNumber}-${route.replace(/\//g, '_')}-errors.png`
    })

    console.log(`❌ Found ${criticalErrors.length} critical errors in ${route}`)
  }
}
```

**Crear issue por cada error de consola CRITICAL:**
```bash
/github:issue \
  --title "[QA] Console error en #${issue_number}: ${error_summary}" \
  --body "## Issue Original Bloqueado
#${issue_number} - ${issue_title}

## Error de Consola JavaScript
\`\`\`
${error_text}
\`\`\`

## Ubicación
- Ruta: ${route}
- Archivo: ${source_file}
- Línea: ${line_number}

## Contexto
${error_stacktrace}

## Screenshot
![Error Screenshot](.claude/qa-screenshots/issue-${issueNumber}-errors.png)

## Impacto
- Severidad: CRITICAL
- Bloquea: #${issue_number}
- Afecta funcionalidad de usuario

## Pasos para Reproducir
1. Navegar a ${route}
2. ${action_performed}
3. Observar error en consola

## Acción Requerida
Corregir el error JavaScript antes de mover a Reviewed." \
  --label "bug,qa-failed,javascript,auto-created,priority:high"
```

### E. Verificación Browser - Network Exhaustiva

```javascript
// Capturar TODAS las network requests durante navegación
const networkRequests = await mcp__playwright__browser_network_requests()

console.log(`Total requests captured: ${networkRequests.length}`)

// Clasificar por método
const getRequests = networkRequests.filter(r => r.method === 'GET')
const postRequests = networkRequests.filter(r => r.method === 'POST')
const putRequests = networkRequests.filter(r => r.method === 'PUT')
const deleteRequests = networkRequests.filter(r => r.method === 'DELETE')

console.log(`GET: ${getRequests.length}, POST: ${postRequests.length}, PUT: ${putRequests.length}, DELETE: ${deleteRequests.length}`)

// Analizar cada POST/PUT/DELETE request (CRÍTICO para backend)
const criticalRequests = [...postRequests, ...putRequests, ...deleteRequests]

for (const request of criticalRequests) {
  console.log(`\nAnalyzing ${request.method} ${request.url}`)

  // 1. Verificar status code
  const status = request.response.status
  console.log(`  Status: ${status}`)

  if (status >= 400) {
    console.log(`  ❌ FAIL: HTTP ${status}`)

    // Parsear response body para obtener detalles del error
    let errorDetail = ''
    try {
      const responseBody = JSON.parse(request.response.body)
      errorDetail = responseBody.detail || responseBody.message || responseBody.error || 'Unknown error'
    } catch (e) {
      errorDetail = request.response.body.substring(0, 200)
    }

    // Crear issue específico por tipo de error
    let issueTitle = ''
    let severity = 'CRITICAL'

    if (status >= 500) {
      issueTitle = `[QA] API Error ${status} en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`
      severity = 'CRITICAL'
    } else if (status === 422) {
      issueTitle = `[QA] Validation error en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`
      severity = 'HIGH'
    } else if (status === 401 || status === 403) {
      issueTitle = `[QA] Auth error en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`
      severity = 'HIGH'
    } else if (status === 404) {
      issueTitle = `[QA] Not found error en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`
      severity = 'MEDIUM'
    } else {
      issueTitle = `[QA] HTTP ${status} error en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`
      severity = 'HIGH'
    }

    // Crear issue automáticamente
    await createQAIssue({
      title: issueTitle,
      originalIssue: issueNumber,
      errorType: 'API_ERROR',
      severity: severity,
      details: {
        method: request.method,
        url: request.url,
        status: status,
        requestBody: request.postData,
        responseBody: request.response.body,
        errorDetail: errorDetail
      }
    })

    continue
  }

  // 2. Verificar response body es JSON válido
  try {
    const responseData = JSON.parse(request.response.body)
    console.log(`  ✅ Response is valid JSON`)

    // 3. Verificar que no hay errores en response body
    if (responseData.error || responseData.message?.toLowerCase().includes('error')) {
      console.log(`  ❌ FAIL: Response contains error: ${responseData.message || responseData.error}`)

      await createQAIssue({
        title: `[QA] API response error en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`,
        originalIssue: issueNumber,
        errorType: 'API_RESPONSE_ERROR',
        severity: 'HIGH',
        details: {
          method: request.method,
          url: request.url,
          status: status,
          responseError: responseData.message || responseData.error
        }
      })

      continue
    }

    // 4. Verificar tiempo de respuesta
    const responseTime = request.response.timing?.duration || 0
    console.log(`  Response time: ${responseTime}ms`)

    if (responseTime > 5000) {
      console.log(`  ⚠️ WARNING: Slow response (>${responseTime}ms)`)

      await createQAIssue({
        title: `[QA] Performance issue en #${issueNumber}: Slow API response`,
        originalIssue: issueNumber,
        errorType: 'PERFORMANCE',
        severity: 'MEDIUM',
        details: {
          method: request.method,
          url: request.url,
          responseTime: responseTime,
          threshold: 5000
        }
      })
    } else if (responseTime > 3000) {
      console.log(`  ⚠️ Response is slow but acceptable (${responseTime}ms)`)
    }

    console.log(`  ✅ PASS: ${request.method} ${request.url}`)

  } catch (e) {
    console.log(`  ❌ FAIL: Response is not valid JSON`)

    await createQAIssue({
      title: `[QA] Invalid API response en #${issueNumber}: ${request.method} ${request.url.split('?')[0]}`,
      originalIssue: issueNumber,
      errorType: 'INVALID_RESPONSE',
      severity: 'CRITICAL',
      details: {
        method: request.method,
        url: request.url,
        responseBody: request.response.body.substring(0, 500),
        parseError: e.message
      }
    })
  }
}

// Verificar errores especiales
// 1. Backend no está corriendo (ECONNREFUSED)
const backendDownRequests = networkRequests.filter(r =>
  r.error?.includes('ECONNREFUSED') ||
  r.error?.includes('ERR_CONNECTION_REFUSED') ||
  r.response.status === 0
)

if (backendDownRequests.length > 0) {
  await createQAIssue({
    title: `[QA] Backend not running en #${issueNumber}`,
    originalIssue: issueNumber,
    errorType: 'BACKEND_DOWN',
    severity: 'CRITICAL',
    details: {
      affectedRequests: backendDownRequests.length,
      firstFailedUrl: backendDownRequests[0].url
    }
  })
}

// 2. CORS errors
const corsErrors = networkRequests.filter(r =>
  r.error?.includes('CORS') ||
  r.error?.includes('Access-Control-Allow-Origin')
)

if (corsErrors.length > 0) {
  await createQAIssue({
    title: `[QA] CORS error en #${issueNumber}`,
    originalIssue: issueNumber,
    errorType: 'CORS_ERROR',
    severity: 'CRITICAL',
    details: {
      affectedRequests: corsErrors.length,
      urls: corsErrors.map(r => r.url)
    }
  })
}
```

### F. Verificación Browser - Interacciones de Usuario

```javascript
// Identificar acciones del issue
// Ejemplo: Issue dice "crear usuario" → simular flujo completo

const actions = extractActionsFromIssue(issueBody)
// Ejemplo: ["click Nuevo Usuario", "fill form", "submit", "verify success"]

for (const action of actions) {
  console.log(`Performing action: ${action}`)

  try {
    if (action.type === 'click') {
      // Screenshot ANTES del click
      await mcp__playwright__browser_take_screenshot({
        path: `.claude/qa-screenshots/issue-${issueNumber}-before-${action.name}.png`
      })

      // Ejecutar click
      await mcp__playwright__browser_click({
        selector: action.selector
      })

      // Esperar navegación/modal
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Screenshot DESPUÉS del click
      await mcp__playwright__browser_take_screenshot({
        path: `.claude/qa-screenshots/issue-${issueNumber}-after-${action.name}.png`
      })

      // Capturar errores de consola después del click
      const consoleAfterClick = await mcp__playwright__browser_console_messages()
      const errorsAfterClick = consoleAfterClick.filter(m => m.type === 'error')

      if (errorsAfterClick.length > 0) {
        console.log(`❌ Errors after clicking ${action.name}:`, errorsAfterClick)

        await createQAIssue({
          title: `[QA] Error after ${action.name} en #${issueNumber}`,
          originalIssue: issueNumber,
          errorType: 'INTERACTION_ERROR',
          severity: 'HIGH',
          details: {
            action: action.name,
            errors: errorsAfterClick.map(e => e.text),
            screenshotBefore: `.claude/qa-screenshots/issue-${issueNumber}-before-${action.name}.png`,
            screenshotAfter: `.claude/qa-screenshots/issue-${issueNumber}-after-${action.name}.png`
          }
        })
      }
    }

    if (action.type === 'fill_form') {
      // Llenar formulario con datos de prueba
      await mcp__playwright__browser_evaluate({
        expression: `
          document.querySelector('${action.nameSelector}').value = '${action.testData.nombre}';
          document.querySelector('${action.emailSelector}').value = '${action.testData.email}';
          document.querySelector('${action.rolSelector}').value = '${action.testData.rol}';
        `
      })

      // Screenshot del formulario llenado
      await mcp__playwright__browser_take_screenshot({
        path: `.claude/qa-screenshots/issue-${issueNumber}-form-filled.png`
      })
    }

    if (action.type === 'submit') {
      // Screenshot ANTES del submit
      await mcp__playwright__browser_take_screenshot({
        path: `.claude/qa-screenshots/issue-${issueNumber}-before-submit.png`
      })

      // Capturar network requests ANTES del submit
      const networkBefore = await mcp__playwright__browser_network_requests()

      // Submit formulario
      await mcp__playwright__browser_click({
        selector: action.submitSelector
      })

      // Esperar respuesta
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Capturar network requests DESPUÉS del submit
      const networkAfter = await mcp__playwright__browser_network_requests()

      // Encontrar el POST request generado
      const newRequests = networkAfter.filter(r =>
        !networkBefore.some(b => b.url === r.url && b.timestamp === r.timestamp)
      )

      const postRequest = newRequests.find(r => r.method === 'POST')

      if (postRequest && postRequest.response.status >= 400) {
        console.log(`❌ Submit failed: ${postRequest.response.status}`)

        // Ya se habrá creado issue en la verificación de network
        // Aquí solo capturamos evidencia adicional
      }

      // Screenshot DESPUÉS del submit
      await mcp__playwright__browser_take_screenshot({
        path: `.claude/qa-screenshots/issue-${issueNumber}-after-submit.png`
      })

      // Verificar mensaje de éxito (toast, alert, redirección)
      const pageContent = await mcp__playwright__browser_snapshot()

      if (!pageContent.includes('éxito') &&
          !pageContent.includes('success') &&
          !pageContent.includes('creado') &&
          !pageContent.includes('created')) {
        console.log(`⚠️ No success message found after submit`)

        await createQAIssue({
          title: `[QA] No success feedback after submit en #${issueNumber}`,
          originalIssue: issueNumber,
          errorType: 'UX_ISSUE',
          severity: 'MEDIUM',
          details: {
            action: 'submit',
            issue: 'No success message displayed to user',
            screenshot: `.claude/qa-screenshots/issue-${issueNumber}-after-submit.png`
          }
        })
      }
    }

  } catch (error) {
    console.log(`❌ Action failed: ${action.name}`, error)

    await createQAIssue({
      title: `[QA] Failed to perform ${action.name} en #${issueNumber}`,
      originalIssue: issueNumber,
      errorType: 'INTERACTION_ERROR',
      severity: 'CRITICAL',
      details: {
        action: action.name,
        error: error.message,
        stackTrace: error.stack
      }
    })
  }
}
```

### G. Verificación de Performance y Estado

```javascript
// 1. Verificar tiempo de carga de página
const performanceMetrics = await mcp__playwright__browser_evaluate({
  expression: `
    JSON.stringify({
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      resourcesLoaded: performance.getEntriesByType('resource').length,
      memoryUsed: performance.memory?.usedJSHeapSize,
      memoryLimit: performance.memory?.jsHeapSizeLimit
    })
  `
})

const metrics = JSON.parse(performanceMetrics)
console.log('Performance metrics:', metrics)

if (metrics.loadTime > 3000) {
  console.log(`⚠️ Page load time is slow: ${metrics.loadTime}ms`)

  await createQAIssue({
    title: `[QA] Slow page load en #${issueNumber}: ${metrics.loadTime}ms`,
    originalIssue: issueNumber,
    errorType: 'PERFORMANCE',
    severity: 'MEDIUM',
    details: {
      loadTime: metrics.loadTime,
      domReady: metrics.domReady,
      threshold: 3000,
      recommendation: 'Optimize bundle size, lazy load components, use code splitting'
    }
  })
}

// 2. Verificar estado de React Query (TanStack Query)
const queryState = await mcp__playwright__browser_evaluate({
  expression: `
    (() => {
      const queryClient = window.__REACT_QUERY_DEVTOOLS_CONTEXT__?.queryClient;
      if (!queryClient) return { error: 'QueryClient not found' };

      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      return {
        totalQueries: queries.length,
        fetchingQueries: queries.filter(q => q.state.isFetching).length,
        errorQueries: queries.filter(q => q.state.isError).length,
        staleQueries: queries.filter(q => q.state.isStale).length,
        errors: queries.filter(q => q.state.isError).map(q => ({
          queryKey: q.queryKey,
          error: q.state.error?.message
        }))
      };
    })()
  `
})

const queryInfo = JSON.parse(queryState)

if (queryInfo.errorQueries > 0) {
  console.log(`❌ Found ${queryInfo.errorQueries} queries with errors`)

  for (const errorQuery of queryInfo.errors) {
    await createQAIssue({
      title: `[QA] Query error en #${issueNumber}: ${errorQuery.queryKey}`,
      originalIssue: issueNumber,
      errorType: 'QUERY_ERROR',
      severity: 'HIGH',
      details: {
        queryKey: errorQuery.queryKey,
        error: errorQuery.error
      }
    })
  }
}

// 3. Verificar localStorage/sessionStorage
const storageState = await mcp__playwright__browser_evaluate({
  expression: `
    JSON.stringify({
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {}),
      sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
        acc[key] = sessionStorage.getItem(key);
        return acc;
      }, {})
    })
  `
})

const storage = JSON.parse(storageState)

// Verificar que auth token existe si es requerido
if (issueRequiresAuth && !storage.localStorage.auth_token) {
  await createQAIssue({
    title: `[QA] Missing auth token en #${issueNumber}`,
    originalIssue: issueNumber,
    errorType: 'AUTH_ISSUE',
    severity: 'HIGH',
    details: {
      issue: 'Auth token not found in localStorage',
      localStorage: Object.keys(storage.localStorage)
    }
  })
}
```

## PASO 3: Crear Issue Automáticamente por Error

Función helper para crear issues automáticamente:

```javascript
async function createQAIssue({ title, originalIssue, errorType, severity, details }) {
  // Construir body del issue con toda la información
  const body = `## Issue Original Bloqueado
#${originalIssue} - ${originalIssueTitle}

Este issue no puede moverse a Reviewed por el siguiente error.

## Error Detectado
**Tipo:** ${errorType}
**Severidad:** ${severity}

${formatErrorDetails(details)}

${details.screenshot ? `## Screenshot\n![Error Screenshot](${details.screenshot})` : ''}

${details.requestBody ? `## Request\n\`\`\`json\n${JSON.stringify(JSON.parse(details.requestBody), null, 2)}\n\`\`\`` : ''}

${details.responseBody ? `## Response\n\`\`\`json\n${details.responseBody.substring(0, 1000)}\n\`\`\`` : ''}

${details.stackTrace ? `## Stack Trace\n\`\`\`\n${details.stackTrace}\n\`\`\`` : ''}

## Impacto
- Severidad: ${severity}
- Bloquea: #${originalIssue}
${severity === 'CRITICAL' ? '- Rompe funcionalidad core' : ''}
${errorType === 'API_ERROR' ? '- Backend no funciona correctamente' : ''}

## Acción Requerida
${getActionRequired(errorType, details)}

---
🤖 Auto-created by QA Review
`

  // Ejecutar /github:issue command
  console.log(`Creating QA issue: ${title}`)

  const labels = [
    'bug',
    'qa-failed',
    'auto-created',
    `severity:${severity.toLowerCase()}`,
    errorType.toLowerCase().replace(/_/g, '-')
  ]

  // Usar el command /github:issue
  await executeCommand('/github:issue', {
    title: title,
    body: body,
    labels: labels.join(','),
    assignees: originalIssueAssignees,
    // Opcional: agregar a mismo proyecto
    project: projectNumber
  })

  // Guardar referencia del issue creado
  createdIssues.push({
    originalIssue: originalIssue,
    newIssue: title,
    errorType: errorType,
    severity: severity
  })
}

function formatErrorDetails(details) {
  let formatted = ''

  if (details.method && details.url) {
    formatted += `**Request:** ${details.method} ${details.url}\n`
  }

  if (details.status) {
    formatted += `**Status Code:** ${details.status}\n`
  }

  if (details.errorDetail) {
    formatted += `**Error:** ${details.errorDetail}\n`
  }

  if (details.responseTime) {
    formatted += `**Response Time:** ${details.responseTime}ms (threshold: ${details.threshold}ms)\n`
  }

  if (details.errors && details.errors.length > 0) {
    formatted += `**Errors:**\n`
    details.errors.forEach(err => {
      formatted += `- ${err}\n`
    })
  }

  if (details.action) {
    formatted += `**Action:** ${details.action}\n`
  }

  return formatted
}

function getActionRequired(errorType, details) {
  switch (errorType) {
    case 'API_ERROR':
      return `Verificar el backend y corregir el error ${details.status}. Revisar logs del servidor para más detalles.`
    case 'TYPESCRIPT_ERROR':
      return `Corregir los errores de tipos en TypeScript antes de mover a Reviewed.`
    case 'CONSOLE_ERROR':
      return `Corregir el error JavaScript en ${details.sourceFile || 'el archivo indicado'}.`
    case 'CORS_ERROR':
      return `Configurar CORS correctamente en el backend para permitir requests desde frontend.`
    case 'BACKEND_DOWN':
      return `Iniciar el servidor backend o verificar conectividad.`
    case 'PERFORMANCE':
      return `Optimizar el código para mejorar tiempos de respuesta. Objetivo: <3s para requests.`
    case 'INTERACTION_ERROR':
      return `Verificar el flujo de usuario y corregir el error en la acción: ${details.action}`
    case 'AUTH_ISSUE':
      return `Verificar que el token de autenticación se guarda correctamente en localStorage.`
    default:
      return `Revisar y corregir el error antes de mover a Reviewed.`
  }
}
```

## PASO 4: Comentar en Issue Original

Cuando se detectan errores en un issue, agregar comentario con enlaces a issues creados:

```bash
# Contar issues creados para este issue original
created_count=$(echo "$createdIssues" | jq "[.[] | select(.originalIssue == $issue_number)] | length")

if [ $created_count -gt 0 ]; then
  # Construir lista de issues creados
  issues_list=$(echo "$createdIssues" | jq -r "[.[] | select(.originalIssue == $issue_number)] | .[] | \"- 🔴 [\(.errorType)] \(.newIssue) - Severity: \(.severity)\"")

  # Agregar comentario al issue original
  gh issue comment $issue_number --body "$(cat <<EOF
## ⚠️ QA Review Failed

Este issue no puede moverse a Reviewed por los siguientes errores detectados.

### Errores Detectados ($created_count)
$issues_list

### Próximos Pasos
1. Resolver todos los issues creados arriba
2. Volver a ejecutar \`/qa:review-done --project=$projectNumber\`
3. Si todos los issues están resueltos, este issue se moverá automáticamente a Reviewed

---
🤖 Auto-generated by QA Review - $(date +"%Y-%m-%d %H:%M:%S")
EOF
)"

  echo "✅ Comment added to issue #$issue_number with $created_count linked issues"
fi
```

## PASO 5: Decisión Final

```javascript
// Para cada issue verificado, decidir acción
if (errorsDetected.length === 0) {
  // ✅ TODAS LAS VERIFICACIONES PASARON
  console.log(`✅ Issue #${issueNumber}: All checks passed`)

  // Mover a columna "Reviewed"
  await moveIssueToReviewed(issueNumber, projectId, itemId)

  approvedIssues.push(issueNumber)

} else {
  // ❌ HAY ERRORES DETECTADOS
  console.log(`❌ Issue #${issueNumber}: ${errorsDetected.length} errors found`)

  // Issues ya fueron creados en las verificaciones anteriores
  // Aquí solo registramos y dejamos en "Done"

  failedIssues.push({
    number: issueNumber,
    title: issueTitle,
    errorsCount: errorsDetected.length,
    createdIssues: createdIssues.filter(ci => ci.originalIssue === issueNumber)
  })
}
```

## PASO 6: Resumen Final Simplificado

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QA REVIEW COMPLETE - Project #7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Approved → Reviewed:     12 issues
❌ Failed → Stay in Done:    3 issues
🐛 Issues Created:           8 issues

Failed Issues:
  #210 → 3 errors → 3 issues created
    - [API_ERROR] API Error 500 POST /api/v1/usuarios
    - [CONSOLE_ERROR] Console error: Cannot read property 'map'
    - [PERFORMANCE] Slow page load: 5230ms

  #211 → 2 errors → 2 issues created (1 grouped)
    - [API_ERROR] API Error 500 POST /api/v1/centros-coste (grouped with #210)
    - [TYPESCRIPT_ERROR] TypeScript compilation error

  #216 → 3 errors → 3 issues created
    - [CORS_ERROR] CORS error blocking requests
    - [CONSOLE_ERROR] Uncaught TypeError in UserForm.tsx
    - [INTERACTION_ERROR] Error after clicking "Submit"

⏱️  Time: 12 min 45 sec

Next Steps:
  1. Resolve the 8 issues created (see project board)
  2. Re-run: /qa:review-done --project=7
  3. Issues will auto-move to Reviewed when all checks pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Agrupación Inteligente de Errores

Si múltiples issues tienen el MISMO error (ej: mismo API endpoint 500), agrupar:

```bash
# Detectar errores duplicados
duplicates=$(echo "$createdIssues" | jq 'group_by(.errorType + .details.url) | map(select(length > 1))')

for group in $duplicates; do
  # Obtener issues afectados
  affected=$(echo "$group" | jq -r '.[].originalIssue' | tr '\n' ',' | sed 's/,$//')
  error_detail=$(echo "$group" | jq -r '.[0].details.errorDetail')

  # Crear issue agrupado
  /github:issue \
    --title "[QA] ${error_detail} - Affects ${affected_count} issues" \
    --body "## Issues Afectados
$(echo "$group" | jq -r '.[] | "- #\(.originalIssue) - \(.originalIssueTitle)"')

## Error Común
${error_detail}

## Impacto
- Severidad: CRITICAL
- Bloquea ${affected_count} issues en Done

## Acción Requerida
Resolver este error desbloqueará todos los issues afectados." \
    --label "bug,qa-failed,grouped,priority:critical"
done
```

## Casos Especiales

### 1. Proyecto sin Issues en Done

```
ℹ️  NO ISSUES TO REVIEW

Proyecto #7: No hay issues en columna "Done"
✅ Nada que revisar
```

### 2. Todos Aprobados

```
✅ ALL ISSUES APPROVED

15/15 issues pasaron QA
🎉 Todos movidos a Reviewed
```

### 3. Backend no está corriendo

Si el backend no responde, crear UN solo issue agrupado:

```
[QA] Backend not running - Affects ALL frontend issues
```

## Optimizaciones

1. **Browser session reutilizada:** Un solo navegador para todos los issues
2. **TypeScript incremental:** Cache de compilación entre issues
3. **Screenshots lazy:** Solo capturar cuando hay errores
4. **Network capture continua:** Capturar una vez por issue, analizar después

## Notas Importantes

- **NUNCA** mover a Reviewed si hay errores
- **SIEMPRE** crear issue por cada error detectado
- **SIEMPRE** comentar en issue original con enlaces
- **SIEMPRE** capturar evidencia (screenshots, logs, network traces)
- Issues creados automáticamente tienen labels: `bug,qa-failed,auto-created,severity:X`
- Verificaciones Playwright son EXHAUSTIVAS - no omitir ninguna
