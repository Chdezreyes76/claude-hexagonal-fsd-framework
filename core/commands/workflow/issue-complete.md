---
description: Orquesta el flujo completo de un issue - seleccionar, implementar, review, mergear, siguiente (con modo bucle)
allowed-tools: Skill, AskUserQuestion, Bash(git:*), Bash(gh:*), Task
---

# Workflow: Issue Complete for $ARGUMENTS

Automatiza el flujo completo de 7 pasos para resolver issues con máxima consistencia y calidad.

## Modos de Ejecución

### Modo Normal (Default)
Ejecuta un issue y pregunta si continuar después de cada uno.
```
/workflow:issue-complete
```

### Modo Bucle Automático
Ejecuta issues en bucle continuo hasta que el usuario detenga o no haya más issues disponibles.
```
/workflow:issue-complete --loop
/workflow:issue-complete --loop --max=5        # Máximo 5 issues
/workflow:issue-complete --loop --project=7    # Solo issues del proyecto #7
/workflow:issue-complete --loop --max=3 --project=7  # Combinar ambos
```

### Modo Totalmente Autónomo ⭐ (Nuevo - Fases 4-6)
Ejecuta el flujo completo sin intervención manual usando auto-selección y estrategias automáticas.
```
/workflow:issue-complete --loop --max=10 --project=7 --autonomous
```

El flag `--autonomous` es un **alias inteligente** que habilita automáticamente:
- ✅ `--auto-select` - Auto-selecciona el issue más prioritario sin preguntar
- ✅ `--auto-fix-reviews=2` - Hasta 2 ciclos de auto-corrección si code review falla (Fase 4)
- ✅ `--skip-on-failure` - Salta issues que fallan en lugar de preguntar
- ✅ `--auto-resolve-conflicts` - Intenta resolver conflictos git automáticamente (Fase 5)
- ✅ `--save-session` - Guarda progreso después de cada issue (Fase 6)
- ✅ `--timeout-per-issue=10` - Timeout de 10 minutos por issue (Fase 6)
- ✅ `--max-consecutive-failures=3` - Circuit breaker después de 3 fallos (Fase 6)
- ✅ `--epic-breakdown-on-failure` - Convierte issues complejos a Epics (Fase 2)

**Parámetros disponibles**:
- `--loop`: Activa modo bucle automático
- `--max=N`: Limita a N issues como máximo
- `--project=N`: Filtra solo issues del proyecto de GitHub #N
- `--autonomous`: ⭐ Habilita todas las características autónomas con valores óptimos
- `--auto-select`: Auto-selecciona el issue #1 sin preguntar
- `--auto-fix-reviews=N`: Permite N ciclos de auto-corrección en code review (default: 2 con --autonomous)
- `--auto-resolve-conflicts`: Intenta resolver conflictos de merge automáticamente
- `--save-session[=path]`: Guarda sesión después de cada issue (default: `.claude/session/workflow-session.json`)
- `--resume=path`: Reanuda sesión desde archivo JSON
- `--timeout-per-issue=N`: Timeout en minutos por issue (default: 10 con --autonomous)
- `--max-consecutive-failures=N`: Circuit breaker después de N fallos (default: 3 con --autonomous)

**Cómo detener el bucle**:
- Escribe "detener", "stop", "salir" o "exit" en cualquier momento
- Se detendrá automáticamente si no hay más issues prioritarios (en el proyecto especificado)
- Se detendrá automáticamente si alcanza --max (si se especificó)

## Flujo Orquestado

```
1. /github:next          → Seleccionar issue
2. /github:start         → Crear rama
3. /issue-planner        → Obtener plan de implementación
4. [Implementación automática]
5. /github:pr            → Crear PR
6. /quality:review       → Code review ⭐ CRÍTICO
7. /github:merge         → Mergear PR
8. Loop                  → Siguiente issue (repetir)
```

## PASO 1: Seleccionar Issue

### Parsear Parámetros de $ARGUMENTS

Primero, detectar los flags de autonomía:

```javascript
// Detectar flags principales
const loopMode = $ARGUMENTS.includes('--loop')
const autonomousMode = $ARGUMENTS.includes('--autonomous')

// Extraer --max=N
const maxMatch = $ARGUMENTS.match(/--max=(\d+)/)
const maxIssues = maxMatch ? parseInt(maxMatch[1]) : null

// Extraer --project=N
const projectMatch = $ARGUMENTS.match(/--project=(\d+)/)
const projectNumber = projectMatch ? parseInt(projectMatch[1]) : null

// ============================================================
// FASE 7: --autonomous es un ALIAS que activa todo lo siguiente
// ============================================================

// Auto-selección (Fase 1)
const autoSelectExplicit = $ARGUMENTS.includes('--auto-select')
const autoSelect = autoSelectExplicit || autonomousMode

// Auto-corrección de code reviews (Fase 4)
const autoFixMatch = $ARGUMENTS.match(/--auto-fix-reviews=(\d+)/)
const autoFixReviews = autoFixMatch ? parseInt(autoFixMatch[1]) : (autonomousMode ? 2 : 0)

// Skip on failure
const skipOnFailure = $ARGUMENTS.includes('--skip-on-failure') || autonomousMode

// Auto-resolución de conflictos (Fase 5)
const autoResolveConflictsExplicit = $ARGUMENTS.includes('--auto-resolve-conflicts')
const autoResolveConflicts = autoResolveConflictsExplicit || autonomousMode

// Epic breakdown on failure (Fase 2)
const epicBreakdownOnFailure = $ARGUMENTS.includes('--epic-breakdown-on-failure') || autonomousMode

// Persistencia de sesión (Fase 6)
const saveSessionMatch = $ARGUMENTS.match(/--save-session(?:=(.+))?/)
const saveSession = saveSessionMatch
  ? (saveSessionMatch[1] || '.claude/session/workflow-session.json')
  : (autonomousMode ? '.claude/session/workflow-session.json' : null)

const resumeMatch = $ARGUMENTS.match(/--resume=(.+)/)
const resumeSessionPath = resumeMatch ? resumeMatch[1] : null

// Timeout por issue (Fase 6)
const timeoutMatch = $ARGUMENTS.match(/--timeout-per-issue=(\d+)/)
const timeoutPerIssue = timeoutMatch
  ? parseInt(timeoutMatch[1])
  : (autonomousMode ? 10 : null)  // Default: 10 min en modo autónomo

// Circuit breaker (Fase 6)
const maxFailuresMatch = $ARGUMENTS.match(/--max-consecutive-failures=(\d+)/)
const maxConsecutiveFailures = maxFailuresMatch
  ? parseInt(maxFailuresMatch[1])
  : (autonomousMode ? 3 : null)  // Default: 3 en modo autónomo

// ============================================================
// Resumen de configuración cuando --autonomous está activo
// ============================================================
if (autonomousMode) {
  console.log(`\n⚡ MODO AUTÓNOMO ACTIVADO`)
  console.log(`   Configuración habilitada automáticamente:`)
  console.log(`   ├─ Auto-selección: ✅`)
  console.log(`   ├─ Auto-corrección reviews: ${autoFixReviews} ciclos`)
  console.log(`   ├─ Skip on failure: ✅`)
  console.log(`   ├─ Auto-resolve conflicts: ✅`)
  console.log(`   ├─ Epic breakdown: ✅`)
  console.log(`   ├─ Persistencia sesión: ✅`)
  console.log(`   ├─ Timeout por issue: ${timeoutPerIssue} min`)
  console.log(`   └─ Circuit breaker: ${maxConsecutiveFailures} fallos`)
  console.log()
}
```

### Inicializar o Reanudar Sesión (Nuevo - Fase 6)

```javascript
let session

if (resumeSessionPath) {
  // REANUDAR SESIÓN EXISTENTE
  console.log(`📂 Reanudando sesión desde: ${resumeSessionPath}`)

  try {
    const sessionData = await fs.readFile(resumeSessionPath, 'utf-8')
    session = JSON.parse(sessionData)

    console.log(`\n✅ Sesión cargada:`)
    console.log(`   Iniciada: ${new Date(session.startTime).toLocaleString()}`)
    console.log(`   Issues completados: ${session.issuesResueltos.length}`)
    console.log(`   Issues saltados: ${session.issuesSaltados.length}`)
    console.log(`   Issues pendientes: ${session.issuesPendientes.length}`)
    console.log(`   Progreso: ${session.issuesResueltos.length}/${session.maxIssues || '∞'}`)
    console.log(`\n⏭️  Continuando desde donde se quedó...\n`)

    // Validar que la sesión sea del mismo proyecto
    if (projectNumber && session.projectNumber !== projectNumber) {
      throw new Error(`La sesión es del proyecto #${session.projectNumber}, pero se especificó --project=${projectNumber}`)
    }

  } catch (error) {
    console.log(`\n❌ Error al cargar sesión: ${error.message}`)
    console.log(`   Iniciando nueva sesión...\n`)
    session = null
  }
}

if (!session) {
  // NUEVA SESIÓN
  // Generar ID único para la sesión
  const generateSessionId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 9)
    return `${timestamp}-${random}`
  }

  session = {
    sessionId: generateSessionId(),  // ID único para tracking
    startTime: Date.now(),
    status: 'in_progress',           // in_progress | completed | aborted
    loopMode: loopMode,
    autonomousMode: autonomousMode,
    autoSelect: autoSelect,
    maxIssues: maxIssues,
    projectNumber: projectNumber,
    saveSession: saveSession,
    timeoutPerIssue: timeoutPerIssue,
    maxConsecutiveFailures: maxConsecutiveFailures,

    // Contadores
    issuesResueltos: [],
    issuesSaltados: [],
    issuesConvertidosEpic: [],
    issuesPendientes: [],

    // Auto-corrección (Fase 4)
    autoFixReviews: autoFixReviews,
    skipOnFailure: skipOnFailure,

    // Auto-resolución de conflictos (Fase 5)
    autoResolveConflicts: autoResolveConflicts,

    // Epic breakdown (Fase 2)
    epicBreakdownOnFailure: epicBreakdownOnFailure,

    // Circuit breaker (Fase 6)
    consecutiveFailures: 0,

    // Estadísticas
    stats: {
      totalImplementationAttempts: 0,
      successfulImplementations: 0,
      autoCorrections: 0,
      conflictsResolved: 0,
      conflictsSkipped: 0
    }
  }

  console.log(`\n🚀 Nueva sesión iniciada`)
  console.log(`   ID: ${session.sessionId}`)
  console.log(`   Modo: ${autonomousMode ? 'Autónomo' : (loopMode ? 'Loop' : 'Normal')}`)
  if (maxIssues) console.log(`   Máximo: ${maxIssues} issues`)
  if (projectNumber) console.log(`   Proyecto: #${projectNumber}`)
  if (saveSession) console.log(`   Guardando en: ${saveSession}`)
  if (timeoutPerIssue) console.log(`   Timeout: ${timeoutPerIssue} minutos por issue`)
  if (maxConsecutiveFailures) console.log(`   Circuit breaker: ${maxConsecutiveFailures} fallos consecutivos`)
  console.log()
}

// Crear directorio de sesiones si no existe
if (saveSession) {
  const sessionDir = path.dirname(saveSession)
  await fs.mkdir(sessionDir, { recursive: true })
}
```

### Sin filtro de proyecto

Ejecutar el command `/github:next`:

```bash
/github:next
```

Esto automáticamente:
- Analiza issues por prioridad
- Muestra top 5 más urgentes
- **Si autoSelect está habilitado**: Selecciona automáticamente el #1 (más prioritario)
- **Si autoSelect está deshabilitado**: Pregunta cuál resolver
- Crea rama e inicia trabajo
- Obtiene plan del issue-planner

**Lógica de auto-selección**:
```javascript
if (loopMode && autoSelect) {
  // En modo loop con auto-select, SIEMPRE seleccionar automáticamente el #1
  const topIssue = priorities[0]
  console.log(`✅ Auto-seleccionado: #${topIssue.number} "${topIssue.title}" (prioridad más alta)`)
  selectedIssue = topIssue
} else {
  // Modo normal: preguntar al usuario
  const answer = await AskUserQuestion("¿Cuál issue quieres resolver?")
  selectedIssue = priorities[answer - 1]
}
```

### Con filtro de proyecto (`--project=N`)

Si se especificó `--project=N` en $ARGUMENTS:

1. **Obtener issues del proyecto**:
   ```bash
   gh project item-list N --owner {{githubOwner}} --format json --limit 1000
   ```

2. **Filtrar solo issues abiertos del proyecto**:
   - Extraer números de issue del JSON
   - Descartar PRs (solo issues)
   - Filtrar por estado OPEN

3. **Obtener detalles y clasificar**:
   - Para cada issue, obtener labels y prioridad
   - Clasificar por prioridad (critical → high → medium → low)
   - Obtener top 5 más prioritarios **del proyecto**

4. **Aplicar auto-selección o preguntar**:
   - Mostrar top 5 del proyecto
   - **Si autoSelect**: Seleccionar automáticamente el #1 del proyecto
   - **Si no autoSelect**: Ejecutar `/github:next` para que el usuario seleccione el issue

**Lógica de auto-selección con proyecto**:
```javascript
if (loopMode && autoSelect && projectNumber) {
  // Auto-seleccionar el issue más prioritario del proyecto
  const projectIssues = await getProjectIssues(projectNumber)
  const topIssue = projectIssues[0]

  console.log(`✅ Auto-seleccionado del proyecto #${projectNumber}: #${topIssue.number} "${topIssue.title}"`)

  // Ejecutar /github:start con el issue específico
  // (esto creará branch, asignará issue, invocará issue-planner agent)
} else if (projectNumber) {
  // Modo normal con proyecto: mostrar top 5 y preguntar
  const projectIssues = await getProjectIssues(projectNumber)
  console.log("Top 5 issues del proyecto:")
  projectIssues.slice(0, 5).forEach((issue, idx) => {
    console.log(`  ${idx + 1}. #${issue.number} [${issue.priority}] ${issue.title}`)
  })

  const answer = await AskUserQuestion("¿Cuál issue del proyecto quieres resolver?")
  const selectedIssue = projectIssues[answer - 1]

  // Ejecutar /github:start con el issue seleccionado
}
```

**Output esperado**: Branch creada, issue asignado (auto-seleccionado o elegido manualmente), plan mostrado

---

### Envolver Issue con Timeout (Nuevo - Fase 6)

Cada issue se ejecuta con un timeout configurable para prevenir bloqueos indefinidos:

```javascript
// Envolver el workflow del issue con timeout
const issueStartTime = Date.now()
let issueResult = null
let timeoutOccurred = false

// Timeout wrapper
const issuePromise = executeIssueWorkflow(issue)  // PASOS 2-5
const timeoutPromise = new Promise((_, reject) => {
  if (session.timeoutPerIssue) {
    setTimeout(() => {
      timeoutOccurred = true
      reject(new Error(`Timeout: Issue excedió ${session.timeoutPerIssue} minutos`))
    }, session.timeoutPerIssue * 60 * 1000)
  } else {
    // Sin timeout, nunca rechazar
    return new Promise(() => {})
  }
})

try {
  issueResult = await Promise.race([issuePromise, timeoutPromise])

  // Issue completado exitosamente
  const issueDuration = Math.round((Date.now() - issueStartTime) / 1000 / 60)

  session.issuesResueltos.push({
    number: issue.number,
    title: issue.title,
    pr: prNumber,
    duration: issueDuration,
    autoCorrections: autoCorrectionCycles || 0,
    conflictsResolved: conflictsResolved || false,
    completedAt: Date.now()
  })

  // Reset consecutive failures
  session.consecutiveFailures = 0

  console.log(`\n✅ Issue #${issue.number} completado exitosamente`)
  console.log(`   Duración: ${issueDuration} minutos`)

} catch (error) {
  const issueDuration = Math.round((Date.now() - issueStartTime) / 1000 / 60)

  if (timeoutOccurred) {
    // TIMEOUT: Issue excedió tiempo máximo
    console.log(`\n⏱️ TIMEOUT: Issue #${issue.number} excedió ${session.timeoutPerIssue} minutos`)
    console.log(`   El issue tomó demasiado tiempo y fue abortado`)

    session.issuesSaltados.push({
      number: issue.number,
      title: issue.title,
      reason: `Timeout después de ${session.timeoutPerIssue} minutos`,
      duration: issueDuration,
      timestamp: Date.now()
    })

    // Incrementar fallos consecutivos
    session.consecutiveFailures++

    // Limpiar estado
    await Bash('git checkout master && git branch -D ' + branchName)

    console.log(`\n⚠️ Saltando issue por timeout`)
    console.log(`   Fallos consecutivos: ${session.consecutiveFailures}/${session.maxConsecutiveFailures}`)

  } else {
    // ERROR: Otro tipo de error
    console.log(`\n❌ Error en issue #${issue.number}: ${error.message}`)

    session.issuesSaltados.push({
      number: issue.number,
      title: issue.title,
      reason: `Error: ${error.message}`,
      duration: issueDuration,
      timestamp: Date.now()
    })

    session.consecutiveFailures++

    console.log(`\n⚠️ Saltando issue por error`)
    console.log(`   Fallos consecutivos: ${session.consecutiveFailures}/${session.maxConsecutiveFailures}`)
  }
}
```

**Beneficios del timeout**:
- ✅ Previene bloqueos indefinidos en issues problemáticos
- ✅ Permite continuar con otros issues en lugar de quedarse atascado
- ✅ Tracking de duración para identificar issues lentos
- ✅ Circuit breaker puede detectar patrones de timeouts

---

## PASO 2: Implementación Automática

Una vez se obtiene el plan del issue-planner, se ejecuta automáticamente:

- El agente especializado (backend-implementer, frontend-implementer o fullstack-implementer) inicia la implementación
- Ejecuta todos los cambios requeridos según el plan
- Realiza commits automáticamente siguiendo las convenciones del proyecto
- Completa la implementación sin intervención del usuario

**Manejo de Fallos de Implementación** (Nuevo - Fase 2):

Si la implementación falla, el workflow reintenta hasta 3 veces:

```javascript
let attempts = 0
const maxAttempts = 3

while (attempts < maxAttempts) {
  try {
    await implementer.run(plan)

    if (implementer.status === 'success') {
      console.log(`✅ Implementación completada exitosamente`)
      break
    } else {
      attempts++
      console.log(`⚠️ Implementación falló (intento ${attempts}/${maxAttempts})`)

      if (attempts < maxAttempts) {
        console.log(`🔄 Reintentando...`)
      }
    }
  } catch (error) {
    attempts++
    console.log(`❌ Error en implementación (intento ${attempts}/${maxAttempts}): ${error}`)
  }
}

// Después de 3 fallos
if (attempts >= maxAttempts && implementer.status !== 'success') {
  console.log(`❌ Issue #${issue.number} falló después de ${maxAttempts} intentos`)

  // Decidir qué hacer según configuración
  if (session.autonomousMode || session.epicBreakdownOnFailure) {
    // ESTRATEGIA 1: Epic Breakdown (PREFERIDO) ⭐
    console.log(`🎯 Issue demasiado complejo, convirtiendo a Epic...`)

    // Ejecutar /github:epic-breakdown <issue-number>
    // Este command retorna información del Epic creado

    console.log(`\n✅ Epic creado exitosamente:`)
    console.log(`   Proyecto: #<projectNumber> - "<projectTitle>"`)
    console.log(`   Issue original → Epic #${issue.number}`)
    console.log(`   Sub-issues creados: <totalSubIssues>`)

    // Mostrar sub-issues creados
    subIssues.forEach((sub, idx) => {
      console.log(`   ${idx + 1}. #${sub.number} [${sub.type}] ${sub.title}`)
    })

    console.log(`\n💡 Resolver Epic con:`)
    console.log(`   /workflow:issue-complete --loop --project=${epicResult.projectNumber} --autonomous`)

    // Registrar en sesión
    session.issuesConvertidosEpic.push({
      number: issue.number,
      title: issue.title,
      projectNumber: epicResult.projectNumber,
      subIssues: epicResult.subIssues,
      reason: 'Implementación falló después de 3 intentos'
    })
    session.issuesConvertedToEpic++

    // Limpiar rama fallida
    await Bash('git checkout master && git branch -D ' + branchName)

    // Continuar con siguiente issue
    console.log(`\n⏭️ Continuando con siguiente issue del loop principal...`)
    continue  // Volver a PASO 1 con siguiente issue

  } else if (session.loopMode && session.skipOnFailure) {
    // ESTRATEGIA 2: Skip simple (fallback)
    console.log(`⚠️ Saltando issue #${issue.number}`)

    session.issuesSaltados.push({
      number: issue.number,
      title: issue.title,
      reason: 'Implementación falló después de 3 intentos'
    })
    session.issuesSkipped++

    // Limpiar rama fallida
    await Bash('git checkout master && git branch -D ' + branchName)

    // Continuar con siguiente issue
    continue

  } else {
    // ESTRATEGIA 3: Preguntar al usuario (modo no autónomo)
    const answer = await AskUserQuestion({
      questions: [{
        question: "La implementación falló 3 veces. ¿Qué quieres hacer?",
        header: "Fallo",
        multiSelect: false,
        options: [
          {
            label: "Convertir a Epic",
            description: "Crear proyecto con sub-issues manejables (recomendado para issues complejos)"
          },
          {
            label: "Implementar manualmente",
            description: "Tú implementas manualmente el issue"
          },
          {
            label: "Saltar issue",
            description: "Omitir este issue y continuar con el siguiente"
          },
          {
            label: "Abortar workflow",
            description: "Cancelar el workflow completo"
          }
        ]
      }]
    })

    if (answer === "Convertir a Epic") {
      // Ejecutar /github:epic-breakdown <issue-number>
      // El command creará el Epic y sub-issues
      continue
    } else if (answer === "Implementar manualmente") {
      console.log(`\n📝 Implementa manualmente el issue y luego ejecuta:`)
      console.log(`   /github:pr`)
      console.log(`   /quality:review`)
      console.log(`   /github:merge`)
      return  // Salir del workflow
    } else if (answer === "Saltar issue") {
      session.issuesSaltados.push({...})
      continue
    } else {
      // Abortar
      await Bash('git checkout master')
      return  // Salir del workflow
    }
  }
}
```

**Output esperado**:
- **Éxito**: Cambios implementados, commits realizados, rama actualizada → Continuar a PASO 3
- **Fallo (modo autónomo)**: Epic creado con sub-issues → Continuar a PASO 1 con siguiente issue
- **Fallo (modo manual)**: Usuario decide qué hacer

---

## PASO 3: Crear Pull Request

Una vez la implementación automática se completa, ejecutar:

```bash
/github:pr
```

Esto automáticamente:
- Hace push de la rama
- Crea PR con descripción auto-generada
- Vincula al issue

**Output esperado**: PR creado con número

---

## PASO 4: Code Review ⭐ CRÍTICO

**ESTE ES EL PASO MÁS IMPORTANTE** - Nunca debe olvidarse.

Ejecutar el command de code review:

```bash
/quality:review
```

Esto ejecuta el agente `code-reviewer` que valida:
- ✅ Feature-Sliced Design respetado
- ✅ TypeScript sin errores
- ✅ Conventional Commits
- ✅ Type safety correcto
- ✅ No duplicación de código
- ✅ Tests agregados (si aplica)

**Resultado**: APROBADO, APPROVED_WITH_WARNINGS o REJECTED

### Parsear Output del Code Reviewer (Nuevo - Fase 4)

El code-reviewer retorna JSON estructurado al final del reporte:

```javascript
// Ejecutar /quality:review (invoca code-reviewer agent que retorna JSON)
// Extraer JSON del output del code-reviewer
const jsonMatch = reviewOutput.match(/\{[\s\S]*"status"[\s\S]*\}/m)

if (jsonMatch) {
  const reviewResult = JSON.parse(jsonMatch[0])

  console.log(`\n📊 Code Review Result:`)
  console.log(`   Status: ${reviewResult.status}`)
  console.log(`   Severity: ${reviewResult.severity}`)
  console.log(`   Critical Issues: ${reviewResult.criticalCount}`)
  console.log(`   Minor Issues: ${reviewResult.minorCount}`)
}
```

### Si APPROVED:
```
✅ Code Review: APROBADO

Validaciones pasadas:
  ✓ FSD Architecture
  ✓ TypeScript OK
  ✓ Commits válidos
  ✓ Type safety
  ✓ No duplicación

→ Continuando a mergear...
```

**Continuar a PASO 5**

### Si APPROVED_WITH_WARNINGS:
```
✅ Code Review: APROBADO CON WARNINGS

Issues menores detectados:
  ⚠️ Query key hardcoded en línea 15
  ⚠️ Falta documentación en función auxiliar

✅ Sin issues críticos - OK para mergear

→ Continuando a mergear...
```

**Continuar a PASO 5** (los warnings no bloquean el merge)

### Si REJECTED - Ciclos de Auto-Corrección (Nuevo - Fase 4):

En modo autónomo, reintentar automáticamente con feedback del review:

```javascript
// Parsear resultado del review
const reviewResult = JSON.parse(jsonMatch[0])

if (reviewResult.status === 'REJECTED') {
  console.log(`\n❌ Code Review: RECHAZADO`)
  console.log(`   ${reviewResult.criticalCount} issues críticos encontrados`)
  console.log(`\n📝 Feedback: ${reviewResult.feedback}`)

  // Mostrar próximos pasos
  console.log(`\n🔧 Próximos pasos:`)
  reviewResult.nextSteps.forEach((step, idx) => {
    console.log(`   ${idx + 1}. ${step}`)
  })

  // Decidir qué hacer según configuración
  if (session.autonomousMode && session.autoFixReviews > 0) {
    // MODO AUTÓNOMO: Auto-corrección con ciclos limitados

    let fixCycle = 0
    const maxFixCycles = session.autoFixReviews  // Default: 2

    while (fixCycle < maxFixCycles) {
      fixCycle++

      console.log(`\n🔄 Auto-Corrección: Ciclo ${fixCycle}/${maxFixCycles}`)
      console.log(`   Reintentando implementación con feedback del review...`)

      // Reintentar implementación con el feedback
      const fixPrompt = `
Corrige los problemas encontrados en el code review anterior.

FEEDBACK DEL REVIEW:
${reviewResult.feedback}

PROBLEMAS CRÍTICOS A CORREGIR:
${reviewResult.issues
  .filter(i => i.severity === 'CRITICAL')
  .map((issue, idx) => `
${idx + 1}. ${issue.title} (${issue.file}:${issue.line})
   Problema: ${issue.problem}
   Solución: ${issue.suggestion}
   ${issue.code_suggestion ? `Código sugerido:\n   ${issue.code_suggestion}` : ''}
`).join('\n')}

PASOS A SEGUIR:
${reviewResult.nextSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

Implementa las correcciones necesarias y haz commit de los cambios.
`

      // Invocar implementador con el feedback
      await implementer.fix(fixPrompt)

      // Volver a ejecutar code review (via /quality:review command)
      console.log(`\n🔍 Re-ejecutando code review...`)
      // Ejecutar /quality:review nuevamente
      const newJsonMatch = newReviewOutput.match(/\{[\s\S]*"status"[\s\S]*\}/m)

      if (newJsonMatch) {
        const newReviewResult = JSON.parse(newJsonMatch[0])

        if (newReviewResult.status === 'APPROVED' || newReviewResult.status === 'APPROVED_WITH_WARNINGS') {
          console.log(`\n✅ Auto-Corrección exitosa en ciclo ${fixCycle}`)
          console.log(`   Status: ${newReviewResult.status}`)

          // Actualizar reviewResult para continuar
          reviewResult = newReviewResult
          break  // Salir del loop, continuar a PASO 5
        } else {
          console.log(`\n⚠️ Ciclo ${fixCycle} completado, aún hay ${newReviewResult.criticalCount} issues críticos`)
          reviewResult = newReviewResult

          if (fixCycle < maxFixCycles) {
            console.log(`   Reintentando en siguiente ciclo...`)
          }
        }
      }
    }

    // Después de todos los ciclos
    if (reviewResult.status === 'REJECTED') {
      console.log(`\n❌ No se pudo auto-corregir después de ${maxFixCycles} ciclos`)
      console.log(`   ${reviewResult.criticalCount} issues críticos persisten`)

      // Decidir qué hacer
      if (session.skipOnFailure) {
        console.log(`\n⚠️ Saltando issue #${issue.number}`)

        session.issuesSaltados.push({
          number: issue.number,
          title: issue.title,
          reason: `Code review rechazado después de ${maxFixCycles} ciclos de auto-corrección`,
          reviewResult: reviewResult
        })
        session.issuesSkipped++

        // Limpiar rama
        await Bash('git checkout master && git branch -D ' + branchName)

        // Continuar con siguiente issue
        continue
      } else {
        // Preguntar al usuario (modo no autónomo)
        askUserWhatToDo()
      }
    } else {
      // Review aprobado después de auto-corrección
      console.log(`\n✅ Issues corregidos, continuando a mergear...`)
      // Continuar a PASO 5
    }

  } else {
    // MODO NO AUTÓNOMO: Preguntar al usuario
    console.log(`\n❌ Code Review: RECHAZADO`)
    console.log(`\nProblemas encontrados:`)

    reviewResult.issues.forEach(issue => {
      console.log(`  ${issue.severity === 'CRITICAL' ? '✗' : '⚠️'} ${issue.title}`)
      console.log(`     ${issue.file}:${issue.line}`)
      console.log(`     ${issue.problem}`)
    })

    const answer = await AskUserQuestion({
      questions: [{
        question: "¿Qué quieres hacer?",
        header: "Review Fail",
        multiSelect: false,
        options: [
          {
            label: "Arreglar manualmente",
            description: "Corrige los problemas y vuelve a ejecutar el review"
          },
          {
            label: "Salir",
            description: "Cancelar workflow y volver a master"
          },
          {
            label: "Forzar merge",
            description: "Mergear de todas formas (NO RECOMENDADO)"
          }
        ]
      }]
    })

    if (answer === "Arreglar manualmente") {
      console.log(`\n📝 Corrige los problemas manualmente y luego ejecuta:`)
      console.log(`   git add .`)
      console.log(`   git commit -m "fix: address code review feedback"`)
      console.log(`   /quality:review`)
      console.log(`   /github:merge`)
      return  // Salir del workflow
    } else if (answer === "Salir") {
      await Bash('git checkout master && git branch -D ' + branchName)
      return  // Salir del workflow
    } else {
      // Forzar merge
      console.log(`\n⚠️ WARNING: Mergeando con issues críticos sin resolver`)
      console.log(`   Esto NO es recomendado y puede introducir bugs`)
      // Continuar a PASO 5
    }
  }
}
```

**Output esperado**:
- **Auto-corrección exitosa**: Review aprobado después de 1-2 ciclos → Continuar a PASO 5
- **Auto-corrección fallida**: Saltar issue (modo autónomo) o preguntar (modo manual)
- **Modo manual**: Usuario decide qué hacer

---

## PASO 5: Mergear PR

Si el review fue aprobado, ejecutar:

```bash
/github:merge
```

Esto automáticamente:
- Mergea PR a master
- Limpia ramas locales y remotas
- Hace pull de cambios
- Vuelve a master

**Output esperado**: PR mergeado, rama limpiada, en master

### Manejo de Conflictos (Nuevo - Fase 5):

El comando `github:merge` ahora intenta resolver conflictos automáticamente en modo autónomo.

**Estrategias de auto-resolución**:
1. **Rebase automático** (preferido)
2. **Merge con estrategia "ours"** (conservador)
3. **Resolución selectiva** (solo archivos de configuración)

**Exit codes**:
- `0`: Merge exitoso
- `1`: Error fatal
- `2`: Conflictos no resueltos (skip issue)

```javascript
// En modo autónomo con --auto-resolve-conflicts
// Ejecutar /github:merge (retorna exit code: 0=success, 1=error, 2=skip)
const mergeExitCode = 0 // placeholder - el command retorna el código

if (mergeExitCode === 2) {
  // Conflictos no pudieron resolverse automáticamente
  console.log(`\n❌ Conflictos de merge no pudieron resolverse automáticamente`)

  if (session.autonomousMode && session.skipOnFailure) {
    console.log(`\n⚠️ Saltando issue #${issue.number}`)

    session.issuesSaltados.push({
      number: issue.number,
      title: issue.title,
      reason: 'Conflictos de merge no resueltos',
      prNumber: prNumber,
      conflictStrategy: 'Requiere resolución manual'
    })
    session.issuesSkipped++

    // Continuar con siguiente issue
    continue
  } else {
    // Modo no autónomo: preguntar al usuario
    console.log(`\n⚠️ El PR tiene conflictos que no se pudieron resolver automáticamente`)
    console.log(`   Debes resolverlos manualmente en GitHub o localmente`)
    return
  }
} else if (mergeExitCode === 1) {
  // Error fatal
  console.log(`\n❌ Error al mergear PR`)

  if (session.autonomousMode && session.skipOnFailure) {
    console.log(`\n⚠️ Saltando issue #${issue.number}`)

    session.issuesSaltados.push({
      number: issue.number,
      title: issue.title,
      reason: 'Error fatal al mergear',
      prNumber: prNumber
    })
    session.issuesSkipped++

    continue
  } else {
    return
  }
}

// Exit code 0: Merge exitoso
console.log(`\n✅ PR #${prNumber} mergeado exitosamente`)
```

**Tracking en sesión**:
- `issuesSaltados`: Array con issues que no pudieron mergearse
- Cada item incluye: `number`, `title`, `reason`, `prNumber`, `conflictStrategy`

**Beneficios**:
- ✅ Intenta resolver conflictos comunes (config files, rebase limpio)
- ✅ No bloquea el workflow en conflictos triviales
- ✅ Skip seguro cuando no puede resolver
- ✅ Tracking completo de issues saltados por conflictos

---

## PASO 6: Siguiente Issue (Loop)

### Guardar Sesión (Nuevo - Fase 6)

Después de completar o saltar un issue, guardar el estado de la sesión:

```javascript
// ============================================================
// Guardar estado de sesión después de cada issue
// ESTRATEGIA: Solo sesión activa (no historial acumulado)
// ============================================================
if (session.saveSession) {
  session.currentIssue = null  // No hay issue en progreso
  session.lastUpdate = Date.now()
  session.duration = Date.now() - session.startTime

  try {
    // Guardar solo sesión ACTUAL (archivo pequeño, rápido de cargar)
    const sessionData = JSON.stringify(session, null, 2)
    const sessionSizeKB = (sessionData.length / 1024).toFixed(1)

    await fs.writeFile(
      session.saveSession,
      sessionData,
      'utf-8'
    )

    console.log(`💾 Sesión guardada: ${session.saveSession}`)
    console.log(`   Issues resueltos: ${session.issuesResueltos.length}`)
    console.log(`   Issues saltados: ${session.issuesSaltados.length}`)
    console.log(`   Tamaño: ${sessionSizeKB} KB`)
  } catch (error) {
    console.log(`⚠️  Error al guardar sesión: ${error.message}`)
  }
}
```

### Circuit Breaker (Nuevo - Fase 6)

Verificar si se debe detener el workflow por demasiados fallos consecutivos:

```javascript
// Circuit breaker: detener si hay muchos fallos consecutivos
if (session.maxConsecutiveFailures && session.consecutiveFailures >= session.maxConsecutiveFailures) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`🔴 CIRCUIT BREAKER ACTIVADO`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log()
  console.log(`❌ ${session.consecutiveFailures} fallos consecutivos detectados`)
  console.log(`   Máximo permitido: ${session.maxConsecutiveFailures}`)
  console.log()
  console.log(`⚠️  Deteniendo workflow para prevenir loops infinitos`)
  console.log()
  console.log(`📊 Estado del workflow:`)
  console.log(`   Issues completados: ${session.issuesResueltos.length}`)
  console.log(`   Issues saltados: ${session.issuesSaltados.length}`)
  console.log(`   Últimos ${session.consecutiveFailures} issues fallaron consecutivamente`)
  console.log()
  console.log(`💡 Posibles causas:`)
  console.log(`   - Issues del proyecto son demasiado complejos`)
  console.log(`   - Problemas con servicios externos (GitHub, tests, etc.)`)
  console.log(`   - Errores de configuración del proyecto`)
  console.log()
  console.log(`🔧 Acciones recomendadas:`)
  console.log(`   1. Revisar issues saltados para identificar patrones`)
  console.log(`   2. Verificar configuración del proyecto`)
  console.log(`   3. Intentar resolver un issue manualmente para diagnosticar`)
  console.log(`   4. Ajustar parámetros (--timeout-per-issue, --max-consecutive-failures)`)
  console.log()

  if (session.saveSession) {
    console.log(`💾 Sesión guardada en: ${session.saveSession}`)
    console.log(`   Para reanudar: /workflow:issue-complete --resume=${session.saveSession}`)
    console.log()
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  // Mostrar resumen y terminar
  showFinalSummary(session)
  return
}
```

### Modo Normal (sin --loop)

Preguntar al usuario si quiere continuar:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Issue completado exitosamente

📊 Estadísticas de esta sesión:
  Issues resueltos:  1
  PRs creados:       1
  PRs mergeados:     1
  Code reviews:      1 (100% aprobado)

¿Quieres resolver otro issue?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Usar AskUserQuestion**:
- "Sí, siguiente issue" → Volver a PASO 1
- "No, terminar sesión" → Mostrar resumen final y terminar

### Modo Bucle (con --loop)

**NO preguntar**, continuar automáticamente EXCEPTO si:
- `session.shouldContinue === false` (usuario pidió detener)
- `session.issuesResueltos >= session.maxIssues` (alcanzó límite)
- No hay más issues prioritarios disponibles

Mostrar progreso entre issues:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Issue #215 completado (3/5)

⏭️  Continuando con siguiente issue...
   (escribe "detener" para pausar el bucle)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Esperar 2 segundos antes de continuar** (dar tiempo para que el usuario pueda escribir "detener")

### Si continúa: Volver a PASO 1
```typescript
// Incrementar contador
session.issuesResueltos++

// Volver al PASO 1 (seleccionar siguiente issue)
// El workflow se repite automáticamente en modo loop
```

### Si termina: Mostrar Resumen
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS FINALES:
  Issues resueltos:    3
  PRs creados:         3
  PRs mergeados:       3
  Code reviews:        3
  Tiempo total:        ~2 horas
  Calidad:             100% (todos aprobados)

📋 ISSUES COMPLETADOS:
  1. #215 [refactor] eliminar @/services → PR #227 ✅
  2. #214 [refactor] actualizar contabilidad → PR #226 ✅
  3. #213 [refactor] actualizar centros-coste → PR #225 ✅

📈 ISSUES PENDIENTES:
  Total abiertos:      11
  ├─ CRITICAL:         0
  ├─ HIGH:             2
  ├─ MEDIUM:           7
  └─ LOW:              2

🎯 PRÓXIMO ISSUE RECOMENDADO:
  #139 [ALTA] Setup TypeScript stricto (45 días esperando)

Para continuar:
  /workflow:issue-complete                        # Modo normal (pregunta)
  /workflow:issue-complete --loop                 # Modo bucle automático
  /workflow:issue-complete --loop --max=3         # Bucle con límite
  /workflow:issue-complete --loop --project=7     # Solo proyecto #7
  /workflow:issue-complete --loop --max=5 --project=7  # Combinar filtros

¡Excelente trabajo! 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Archivar Sesión Completada (Nuevo - Fase 6.1)

Después de mostrar el resumen final, archivar la sesión en el historial:

```javascript
// ============================================================
// Archivar sesión completada en historial
// ESTRATEGIA: Sesión activa → Historial diario
// ============================================================
async function archivarSesion(session) {
  if (!session.saveSession) {
    return  // Archivado deshabilitado
  }

  // Marcar sesión como completada
  session.status = 'completed'
  session.endTime = Date.now()

  const today = new Date().toISOString().split('T')[0]  // 2025-12-23
  const historyDir = path.join('.claude', 'session', 'history')
  const historyFile = path.join(historyDir, `${today}.json`)

  try {
    // Crear directorio si no existe
    await fs.ensureDir(historyDir)

    // Leer historial del día (si existe)
    let dayHistory = {
      date: today,
      sessions: []
    }

    if (await fs.pathExists(historyFile)) {
      const content = await fs.readFile(historyFile, 'utf-8')
      dayHistory = JSON.parse(content)
    }

    // Agregar sesión actual al historial del día
    dayHistory.sessions.push({
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      autonomousMode: session.autonomousMode,
      projectNumber: session.projectNumber,

      // Resumen compacto (para vistas rápidas)
      summary: {
        issuesCompletados: session.issuesResueltos.length,
        issuesSaltados: session.issuesSaltados.length,
        epicsCreados: session.issuesConvertidosEpic.length,
        prsCreados: session.issuesResueltos.length,
        prsMergeados: session.issuesResueltos.length
      },

      // Detalles completos (para auditoría)
      details: {
        issuesResueltos: session.issuesResueltos,
        issuesSaltados: session.issuesSaltados,
        issuesConvertidosEpic: session.issuesConvertidosEpic,
        stats: session.stats
      }
    })

    // Guardar historial del día
    await fs.writeFile(historyFile, JSON.stringify(dayHistory, null, 2))

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📚 Sesión archivada exitosamente`)
    console.log(`   Archivo: ${historyFile}`)
    console.log(`   Sesiones del día: ${dayHistory.sessions.length}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Limpieza automática de archivos antiguos
    await limpiarHistorialAntiguo(historyDir, 30)

  } catch (error) {
    console.log(`⚠️  Error al archivar sesión: ${error.message}`)
  }
}

// ============================================================
// Limpieza automática de historial antiguo
// ============================================================
async function limpiarHistorialAntiguo(historyDir, diasMantener = 30) {
  try {
    const archivos = await fs.readdir(historyDir)
    const ahora = Date.now()
    const maxEdad = diasMantener * 24 * 60 * 60 * 1000

    let archivosEliminados = 0

    for (const archivo of archivos) {
      // Solo procesar archivos JSON
      if (!archivo.endsWith('.json')) {
        continue
      }

      const rutaArchivo = path.join(historyDir, archivo)
      const stats = await fs.stat(rutaArchivo)

      // Eliminar si es más antiguo que diasMantener
      if (ahora - stats.mtime.getTime() > maxEdad) {
        await fs.remove(rutaArchivo)
        archivosEliminados++
      }
    }

    if (archivosEliminados > 0) {
      console.log(`🗑️  Historial antiguo limpiado: ${archivosEliminados} archivos (>${diasMantener} días)`)
    }

  } catch (error) {
    // Silencioso si falla la limpieza
  }
}

// ============================================================
// Al finalizar el workflow, archivar la sesión
// ============================================================
// Después de mostrar el resumen final, llamar:
await archivarSesion(session)
```

**Estructura de archivos resultante**:

```
.claude/session/
├── workflow-session.json          # 📝 Sesión activa (10-50KB)
│                                   # Solo la sesión en progreso
│                                   # Se sobrescribe en cada workflow
│
└── history/                        # 📚 Historial archivado
    ├── 2025-12-23.json            # Todas las sesiones del 23/12
    ├── 2025-12-22.json            # Todas las sesiones del 22/12
    └── 2025-12-21.json            # Todas las sesiones del 21/12
                                    # Archivos >30 días se eliminan auto
```

**Beneficios**:
- ✅ Sesión activa siempre pequeña (<50KB)
- ✅ `--resume` siempre rápido
- ✅ Historial organizado por fecha
- ✅ Auto-limpieza de archivos antiguos
- ✅ Auditoría completa disponible

---

## Manejo de Errores

### Si algo falla en cualquier paso:

1. **Mostrar error claro**:
   ```
   ❌ Error en [PASO X]: [descripción del error]
   ```

2. **Ofrecer opciones de recuperación**:
   ```
   Opciones:
     1. "reintentar" → Volver a intentar el paso
     2. "salir"      → Cancelar workflow
     3. "ayuda"      → Ver más opciones
   ```

3. **Mantener estado consistente**:
   - Siempre saber en qué paso estamos
   - Siempre poder volver a master limpio

### Estados de Error Comunes:

**Error en git push**:
```bash
# Si falla el push:
git status  # Verificar estado
git pull --rebase  # Rebase si hay conflictos
git push  # Reintentar
```

**Conflict al mergear**:
```
❌ Hay conflictos con master

Opciones:
  1. "resolver" → Abrir editor para resolver
  2. "rebase"   → Hacer rebase automático
  3. "salir"    → Abortar merge
```

---

## Variables de Sesión

Mantener tracking durante la sesión:

```typescript
session = {
  // Contadores
  issuesResueltos: 0,
  prsCreados: 0,
  prsMergeados: 0,
  reviewsAprobados: 0,
  reviewsRechazados: 0,
  issuesSkipped: 0,          // Issues saltados
  issuesConvertedToEpic: 0,  // Issues convertidos a Epic

  // Estado
  issueActual: null,
  tiempoInicio: Date.now(),

  // Configuración de bucle
  loopMode: false,           // true si se ejecutó con --loop
  maxIssues: null,           // null = infinito, o número si se especificó --max
  projectNumber: null,       // null = todos los issues, o número de proyecto si se especificó --project
  shouldContinue: true,      // false si usuario pide detener

  // Configuración de autonomía (Fase 1-7)
  autonomousMode: false,     // true si se ejecutó con --autonomous
  autoSelect: false,         // true si se ejecutó con --auto-select o --autonomous
  autoClassifyStrategy: 'ask', // 'ask', 'skip', 'fullstack', 'analyze-files'
  autoFixReviews: 0,         // Ciclos de auto-corrección (0 = deshabilitado, 2 = default con --autonomous)
  skipOnFailure: false,      // true = saltar issues fallidos, false = preguntar
  autoResolveConflicts: false, // true = intentar resolver conflictos automáticamente
  saveSession: false,        // true = guardar sesión para resume
  timeoutPerIssue: 10,       // Timeout en minutos por issue
  maxConsecutiveFailures: 3, // Circuit breaker

  // Lista de issues completados (para resumen final)
  issuesCompletados: [],     // [{number, title, pr, time}]
  issuesSaltados: [],        // [{number, title, reason}]
  issuesConvertidosEpic: []  // [{number, projectNumber, subIssues}]
}
```

**Detectar flags en $ARGUMENTS**:
- Si contiene "--loop" → `session.loopMode = true`
- Si contiene "--max=N" → `session.maxIssues = N`
- Si contiene "--project=N" → `session.projectNumber = N`
- Si contiene "--autonomous" → habilitar todos los modos autónomos:
  ```javascript
  session.autonomousMode = true
  session.autoSelect = true
  session.autoClassifyStrategy = 'analyze-files'
  session.autoFixReviews = 2
  session.skipOnFailure = true  // Nota: con epic-breakdown, no se pierden issues
  session.autoResolveConflicts = true
  session.saveSession = true
  session.timeoutPerIssue = 10
  session.maxConsecutiveFailures = 3
  ```
- Si contiene "--auto-select" → `session.autoSelect = true`

---

## Configuración (Opcional)

Leer de `.claude/skills/issue-workflow/config.json`:

```json
{
  "autoReview": true,         // Si false, pregunta antes de review
  "autoMerge": true,          // Si false, pregunta antes de merge
  "stopOnReviewFails": true,  // Si false, permite forzar merge
  "maxIssuesPerSession": null, // null = infinito
  "requireTests": false       // Si true, review falla sin tests
}
```

---

## Ejemplos de Flujo Completo

### Ejemplo 1: Modo Normal (con pregunta)

```
Usuario: /workflow:issue-complete

[PASO 1: Seleccionar Issue]
→ /github:next
→ Muestra top 5 issues
→ Usuario selecciona #184
→ Rama creada: fix/184-override-button
→ Plan mostrado

[PASO 2: Implementación Automática]
→ Agente especializado inicia automáticamente
→ Ejecuta todos los cambios del plan
→ Realiza commits automáticos
→ Implementación completada

[PASO 3: PR]
→ /github:pr
→ PR #209 creado

[PASO 4: Review ⭐]
→ /quality:review
→ APROBADO ✅

[PASO 5: Merge]
→ /github:merge
→ Mergeado exitosamente

[PASO 6: Loop]
→ "¿Otro issue?"
→ Usuario: "sí"
→ Volver a PASO 1

[...repite...]

→ Usuario: "no"
→ Mostrar resumen
→ FIN
```

### Ejemplo 2: Modo Bucle Automático

```
Usuario: /workflow:issue-complete --loop --max=3

[Session Iniciada: modo bucle, máximo 3 issues]

[ISSUE 1/3]
→ /github:next (automático)
→ Selecciona #215 (más prioritario)
→ Implementa → PR #227 → Review ✅ → Merge ✅
→ "✅ Issue #215 completado (1/3)"
→ Espera 2 segundos...
→ Continúa automáticamente

[ISSUE 2/3]
→ /github:next (automático)
→ Selecciona #214
→ Implementa → PR #226 → Review ✅ → Merge ✅
→ "✅ Issue #214 completado (2/3)"
→ Espera 2 segundos...
→ Continúa automáticamente

[ISSUE 3/3]
→ /github:next (automático)
→ Selecciona #213
→ Implementa → PR #225 → Review ✅ → Merge ✅
→ "✅ Issue #213 completado (3/3)"
→ Límite alcanzado

[Mostrar Resumen Final]
→ 3 issues completados
→ 3 PRs mergeados
→ 100% calidad
→ FIN
```

### Ejemplo 3: Detener Bucle Manualmente

```
Usuario: /workflow:issue-complete --loop

[ISSUE 1/∞]
→ Completa #215 ✅

[ISSUE 2/∞]
→ Completa #214 ✅
→ "⏭️ Continuando con siguiente issue... (escribe 'detener')"

Usuario: detener

→ Bucle detenido por el usuario
→ Mostrar resumen de 2 issues completados
→ FIN
```

### Ejemplo 4: Modo Bucle con Proyecto Específico

```
Usuario: /workflow:issue-complete --loop --max=3 --project=7

[Session Iniciada: modo bucle, máximo 3 issues, proyecto #7]

[Obteniendo issues del proyecto #7...]
→ gh project item-list 7 --owner {{githubOwner}} --format json
→ Encontrados 12 issues abiertos en proyecto #7
→ Top 5 prioritarios del proyecto:
   1. #236 [ALTA] refactor: UserListItem.tsx
   2. #235 [ALTA] refactor: EntityFormModal
   3. #234 [ALTA] refactor: UserCard.tsx
   4. #233 [ALTA] refactor: UserAvatar.tsx
   5. #232 [ALTA] refactor: estructura usuario/

[ISSUE 1/3 - Del proyecto #7]
→ Selecciona automáticamente #236 (más prioritario)
→ Implementa → PR #230 → Review ✅ → Merge ✅
→ "✅ Issue #236 completado (1/3)"
→ Espera 2 segundos...

[ISSUE 2/3 - Del proyecto #7]
→ Selecciona #234 (siguiente prioritario)
→ Implementa → PR #231 → Review ✅ → Merge ✅
→ "✅ Issue #234 completado (2/3)"
→ Espera 2 segundos...

[ISSUE 3/3 - Del proyecto #7]
→ Selecciona #233
→ Implementa → PR #232 → Review ✅ → Merge ✅
→ "✅ Issue #233 completado (3/3)"
→ Límite alcanzado

[Mostrar Resumen Final]
→ Proyecto: #7 "FSD Migration"
→ 3 issues completados
→ 9 issues restantes en proyecto #7
→ 3 PRs mergeados
→ 100% calidad
→ FIN
```

### Ejemplo 5: Modo Autónomo con Auto-Corrección (Nuevo - Fase 4)

```
Usuario: /workflow:issue-complete --loop --max=3 --autonomous

[Session Iniciada: modo autónomo, máximo 3 issues]

[ISSUE 1/3]
→ Auto-selecciona #150 [ALTA] Implementar validación de usuarios
→ Implementa cambios...
→ PR #240 creado

→ Code Review ejecutándose...
📊 Code Review Result:
   Status: REJECTED
   Severity: CRITICAL
   Critical Issues: 2
   Minor Issues: 1

❌ Code Review: RECHAZADO
   2 issues críticos encontrados

📝 Feedback: El use case CrearUsuarioUseCase accede directamente a UsuarioRepository.
   Debe inyectar UsuarioRepositoryPort. También falta validación de email duplicado.

🔧 Próximos pasos:
   1. Cambiar import de UsuarioRepository a UsuarioRepositoryPort
   2. Modificar __init__ para recibir port en lugar de repository
   3. Agregar validación de email duplicado antes de crear usuario

🔄 Auto-Corrección: Ciclo 1/2
   Reintentando implementación con feedback del review...

   → Corrigiendo CrearUsuarioUseCase...
   → Cambiando Repository por RepositoryPort
   → Agregando validación de email duplicado
   → Commit: "fix: use port instead of repository, add email validation"

🔍 Re-ejecutando code review...

📊 Code Review Result:
   Status: APPROVED_WITH_WARNINGS
   Severity: MINOR
   Critical Issues: 0
   Minor Issues: 1

✅ Auto-Corrección exitosa en ciclo 1
   Status: APPROVED_WITH_WARNINGS

✅ Code Review: APROBADO CON WARNINGS

Issues menores detectados:
  ⚠️ Query key hardcoded en línea 15

✅ Sin issues críticos - OK para mergear

→ Merge ✅
→ "✅ Issue #150 completado (1/3) - Auto-corregido en 1 ciclo"

[ISSUE 2/3]
→ Auto-selecciona #151 [MEDIA] Refactor authentication hook
→ Implementa → PR #241 → Review ✅ → Merge ✅
→ "✅ Issue #151 completado (2/3)"

[ISSUE 3/3]
→ Auto-selecciona #152 [ALTA] Add user permissions
→ Implementa cambios...
→ PR #242 creado

→ Code Review ejecutándose...
❌ Code Review: RECHAZADO (3 issues críticos)

🔄 Auto-Corrección: Ciclo 1/2
   → Corrigiendo...
   → Review: RECHAZADO (2 issues críticos persisten)

🔄 Auto-Corrección: Ciclo 2/2
   → Corrigiendo...
   → Review: RECHAZADO (1 issue crítico persiste)

❌ No se pudo auto-corregir después de 2 ciclos
   1 issues críticos persisten

⚠️ Saltando issue #152
   Razón: Code review rechazado después de 2 ciclos de auto-corrección

→ Continúa con siguiente issue...

[Mostrar Resumen Final]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS FINALES:
  Issues procesados:   3/3 (100%)
  ├─ ✅ Completados:   2 (67%)
  ├─ 🔄 Auto-corregidos: 1 (33% de completados)
  ├─ ⚠️ Saltados:      1 (33%)
  └─ ❌ Abortados:     0 (0%)

  PRs creados:         3
  PRs mergeados:       2

  Code reviews:        5 (incluyendo re-reviews)
  ├─ Aprobados 1er intento: 1 (50%)
  └─ Auto-corregidos:       1 (50%)

🔄 AUTO-CORRECCIÓN:
  Ciclos ejecutados:   3 total
  ├─ Exitosos ciclo 1: 1 issue
  └─ Fallidos:         1 issue (después de 2 ciclos)

📋 ISSUES COMPLETADOS:
  1. ✅ #150 [ALTA] Validación usuarios → PR #240 ✅ (auto-corregido)
  2. ✅ #151 [MEDIA] Refactor auth hook → PR #241 ✅

⚠️ ISSUES SALTADOS (requieren atención manual):
  1. #152 [ALTA] Add user permissions
     Razón: Code review rechazado después de 2 ciclos
     Feedback: "Falta implementar verificación de permisos en capa de dominio"
     Acción: Revisar manualmente y re-implementar

📈 EFECTIVIDAD AUTO-CORRECCIÓN:
  - 50% de reviews rechazados fueron corregidos automáticamente
  - Promedio: 1 ciclo por corrección exitosa
  - Ahorro de tiempo: ~15 minutos

🎯 PRÓXIMO ISSUE RECOMENDADO:
  #153 [ALTA] Implementar logout

💡 RECOMENDACIÓN:
  Issue #152 requiere atención manual. Revisar feedback del code review
  y considerar dividirlo en sub-issues más pequeños si es muy complejo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Ejemplo 6: Modo Autónomo con Auto-Resolución de Conflictos (Nuevo - Fase 5)

```
Usuario: /workflow:issue-complete --loop --max=4 --autonomous --auto-resolve-conflicts

[Session Iniciada: modo autónomo con auto-resolución de conflictos]

[ISSUE 1/4]
→ Auto-selecciona #160 [ALTA] Update user model
→ Implementa cambios...
→ PR #250 creado
→ Code Review: APROBADO ✅
→ Merge exitoso ✅
→ "✅ Issue #160 completado (1/4)"

[ISSUE 2/4]
→ Auto-selecciona #161 [MEDIA] Add pagination to users list
→ Implementa cambios...
→ PR #251 creado
→ Code Review: APROBADO ✅

→ Ejecutando github:merge...

⚠️ Conflictos detectados en PR #251
   Estado mergeable: CONFLICTING

🔧 Intentando resolución automática...

📋 Estrategia 1: Rebase automático
   → git rebase origin/master
   → Rebase completado sin conflictos ✅
   → git push --force-with-lease origin fix/161-add-pagination
   → Esperando a que GitHub actualice PR...

✅ Rebase exitoso sin conflictos
✅ PR ahora es mergeable después de rebase

🤖 Agregando comentario al PR #251:
   "🤖 Conflictos resueltos automáticamente usando estrategia: rebase

   Detalles:
   - Estrategia: rebase automático
   - Archivos afectados: 2
   - Timestamp: 2025-12-22 14:30:45

   Generated with Claude Code"

→ gh pr merge 251 --merge --delete-branch
✅ PR #251 mergeado exitosamente
→ "✅ Issue #161 completado (2/4) - Conflictos resueltos automáticamente"

[ISSUE 3/4]
→ Auto-selecciona #162 [ALTA] Update dependencies
→ Implementa cambios...
→ PR #252 creado
→ Code Review: APROBADO ✅

→ Ejecutando github:merge...

⚠️ Conflictos detectados en PR #252

🔧 Intentando resolución automática...

📋 Estrategia 1: Rebase automático
   → git rebase origin/master
   ❌ Rebase falló (conflictos en código)
   → git rebase --abort

⚠️ Rebase falló, intentando siguiente estrategia...

📋 Estrategia 2: Merge con estrategia 'ours'
   → git merge origin/master -X ours -m "chore: auto-resolve conflicts using ours strategy"
   ❌ Merge falló (conflictos complejos)
   → git merge --abort

⚠️ Merge con 'ours' falló, intentando siguiente estrategia...

📋 Estrategia 3: Análisis selectivo de conflictos
   → git merge origin/master --no-commit --no-ff

   Archivos con conflictos:
   - package.json
   - package-lock.json
   - backend/requirements.txt

🔧 Solo conflictos en archivos de configuración, usando 'theirs'
   ✓ Resuelto package.json (usando versión de master)
   ✓ Resuelto package-lock.json (usando versión de master)
   ✓ Resuelto requirements.txt (usando versión de master)

   → git commit -m "chore: auto-resolve dependency conflicts using theirs"
   → git push origin fix/162-update-dependencies

✅ Conflictos resueltos, PR ahora es mergeable

🤖 Agregando comentario al PR #252:
   "🤖 Conflictos resueltos automáticamente usando estrategia: selective (theirs)

   Detalles:
   - Estrategia: Resolución selectiva de archivos de configuración
   - Archivos resueltos: package.json, package-lock.json, requirements.txt
   - Método: Usar versión de master para dependencias
   - Timestamp: 2025-12-22 14:35:12

   Generated with Claude Code"

→ gh pr merge 252 --merge --delete-branch
✅ PR #252 mergeado exitosamente
→ "✅ Issue #162 completado (3/4) - Conflictos de dependencias resueltos"

[ISSUE 4/4]
→ Auto-selecciona #163 [ALTA] Refactor user service
→ Implementa cambios...
→ PR #253 creado
→ Code Review: APROBADO ✅

→ Ejecutando github:merge...

⚠️ Conflictos detectados en PR #253

🔧 Intentando resolución automática...

📋 Estrategia 1: Rebase automático
   → git rebase origin/master
   ❌ Rebase falló
   → git rebase --abort

📋 Estrategia 2: Merge con estrategia 'ours'
   ❌ Merge falló

📋 Estrategia 3: Análisis selectivo
   Archivos con conflictos:
   - backend/application/use_cases/usuario/crear_usuario_use_case.py
   - backend/domain/entities/usuario.py
   - frontend/src/features/usuarios/services/usuarioService.ts

⚠️ Conflictos en código fuente detectados
   No es seguro resolver automáticamente

❌ No se pudieron resolver conflictos automáticamente

Archivos con conflictos:
- backend/application/use_cases/usuario/crear_usuario_use_case.py
- backend/domain/entities/usuario.py
- frontend/src/features/usuarios/services/usuarioService.ts

Opciones:
  1. Resolver manualmente en la branch fix/163-refactor-user-service
  2. Saltar este issue (en modo autónomo)

⚠️ Modo autónomo: Saltando issue por conflictos no resueltos

→ "⚠️ Issue #163 saltado (4/4) - Conflictos en código fuente requieren resolución manual"

[Mostrar Resumen Final]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS FINALES:
  Issues procesados:   4/4 (100%)
  ├─ ✅ Completados:   3 (75%)
  ├─ ⚠️ Saltados:      1 (25%)
  └─ ❌ Abortados:     0 (0%)

  PRs creados:         4
  PRs mergeados:       3

  Conflictos detectados: 3
  ├─ ✅ Resueltos automáticamente: 2 (67%)
  └─ ⚠️ Requieren atención manual:  1 (33%)

🔧 AUTO-RESOLUCIÓN DE CONFLICTOS:
  Estrategia exitosa:
  ├─ Rebase automático:         1 issue (#161)
  ├─ Resolución selectiva:      1 issue (#162)
  └─ No resoluble:              1 issue (#163)

📋 ISSUES COMPLETADOS:
  1. ✅ #160 [ALTA] Update user model → PR #250 ✅
  2. ✅ #161 [MEDIA] Add pagination → PR #251 ✅ (conflictos: rebase)
  3. ✅ #162 [ALTA] Update dependencies → PR #252 ✅ (conflictos: selective)

⚠️ ISSUES SALTADOS (requieren atención manual):
  1. #163 [ALTA] Refactor user service
     Razón: Conflictos de merge no resueltos
     PR: #253 (abierto, requiere merge manual)
     Archivos en conflicto:
     - backend/application/use_cases/usuario/crear_usuario_use_case.py
     - backend/domain/entities/usuario.py
     - frontend/src/features/usuarios/services/usuarioService.ts

     Acción: Resolver conflictos manualmente y ejecutar:
       git checkout fix/163-refactor-user-service
       # Resolver conflictos...
       git add .
       git commit -m "chore: resolve merge conflicts"
       git push
       /github:merge

📈 EFECTIVIDAD AUTO-RESOLUCIÓN:
  - 67% de conflictos resueltos automáticamente
  - 100% de conflictos en archivos de configuración resueltos
  - 0% de conflictos en código fuente resueltos (requiere revisión manual)
  - Ahorro de tiempo: ~10 minutos

🎯 PRÓXIMO ISSUE RECOMENDADO:
  #164 [MEDIA] Add user filters

💡 RECOMENDACIÓN:
  Issue #163 tiene conflictos en 3 archivos de código. Considera:
  1. Revisar cambios en master que causaron conflictos
  2. Resolver manualmente preservando lógica de negocio
  3. Re-ejecutar code review después de resolver

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Ejemplo 7: Persistencia de Sesión, Timeouts y Circuit Breaker (Nuevo - Fase 6)

```
Usuario: /workflow:issue-complete --loop --max=10 --autonomous --timeout-per-issue=8 --max-consecutive-failures=2

[Session Iniciada con Fase 6]
🚀 Nueva sesión iniciada
   Modo: Autónomo
   Máximo: 10 issues
   Guardando en: .claude/session/workflow-session.json
   Timeout: 8 minutos por issue
   Circuit breaker: 2 fallos consecutivos

[ISSUE 1/10]
→ Auto-selecciona #170 [ALTA] Optimize database queries
→ Tiempo inicio: 14:00:00
→ Implementa cambios...
→ PR #260 creado
→ Code Review: APROBADO ✅
→ Merge exitoso ✅
→ Duración: 5 minutos

✅ Issue #170 completado exitosamente
   Duración: 5 minutos

💾 Sesión guardada: .claude/session/workflow-session.json

[ISSUE 2/10]
→ Auto-selecciona #171 [ALTA] Add real-time notifications
→ Tiempo inicio: 14:05:30
→ Implementa cambios... (complejo, muchos archivos)
→ Tiempo transcurrido: 6 minutos...
→ Tiempo transcurrido: 7 minutos...
→ Tiempo transcurrido: 8 minutos...

⏱️ TIMEOUT: Issue #171 excedió 8 minutos
   El issue tomó demasiado tiempo y fue abortado

⚠️ Saltando issue por timeout
   Fallos consecutivos: 1/2

💾 Sesión guardada: .claude/session/workflow-session.json

[ISSUE 3/10]
→ Auto-selecciona #172 [MEDIA] Update user profile page
→ Tiempo inicio: 14:14:00
→ Implementa cambios...
→ PR #261 creado
→ Code Review: RECHAZADO (2 issues críticos)

🔄 Auto-Corrección: Ciclo 1/2
   → Corrigiendo...
   → Review: RECHAZADO (1 issue crítico persiste)

🔄 Auto-Corrección: Ciclo 2/2
   → Corrigiendo...
   → Review: RECHAZADO (1 issue crítico persiste)

❌ No se pudo auto-corregir después de 2 ciclos

⚠️ Saltando issue #172
   Fallos consecutivos: 2/2

💾 Sesión guardada: .claude/session/workflow-session.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CIRCUIT BREAKER ACTIVADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 2 fallos consecutivos detectados
   Máximo permitido: 2

⚠️  Deteniendo workflow para prevenir loops infinitos

📊 Estado del workflow:
   Issues completados: 1
   Issues saltados: 2
   Últimos 2 issues fallaron consecutivamente

💡 Posibles causas:
   - Issues del proyecto son demasiado complejos
   - Problemas con servicios externos (GitHub, tests, etc.)
   - Errores de configuración del proyecto

🔧 Acciones recomendadas:
   1. Revisar issues saltados para identificar patrones
   2. Verificar configuración del proyecto
   3. Intentar resolver un issue manualmente para diagnosticar
   4. Ajustar parámetros (--timeout-per-issue, --max-consecutive-failures)

💾 Sesión guardada en: .claude/session/workflow-session.json
   Para reanudar: /workflow:issue-complete --resume=.claude/session/workflow-session.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Mostrar Resumen Final]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA (Circuit Breaker)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duración total: 14 minutos

📊 ESTADÍSTICAS FINALES:
  Issues procesados:   3/10 (30%)
  ├─ ✅ Completados:   1 (33%)
  ├─ ⚠️ Saltados:      2 (67%)
  └─ ❌ Abortados:     0 (0%)

  PRs creados:         2
  PRs mergeados:       1

  Timeouts:            1
  Auto-correcciones:   1 (fallida)
  Circuit breaker:     ACTIVADO después de 2 fallos

📋 ISSUES COMPLETADOS:
  1. ✅ #170 [ALTA] Optimize database queries → PR #260 ✅ (5 min)

⚠️ ISSUES SALTADOS (requieren atención manual):
  1. #171 [ALTA] Add real-time notifications
     Razón: Timeout después de 8 minutos
     Duración: 8 minutos
     Complejidad: ALTA (requiere más tiempo o división)

  2. #172 [MEDIA] Update user profile page
     Razón: Code review rechazado después de 2 ciclos
     PR: #261 (abierto, necesita correcciones)
     Feedback: "Falta manejo de errores en el formulario"

💾 SESIÓN GUARDADA:
  Archivo: .claude/session/workflow-session.json

  Contenido guardado:
  - Issues completados: 1
  - Issues saltados: 2
  - Issues pendientes: 7
  - Configuración de sesión
  - Estadísticas detalladas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

=== 2 HORAS DESPUÉS ===

Usuario: /workflow:issue-complete --resume=.claude/session/workflow-session.json --timeout-per-issue=12

[Reanudando Sesión]
📂 Reanudando sesión desde: .claude/session/workflow-session.json

✅ Sesión cargada:
   Iniciada: 2025-12-22 14:00:00
   Issues completados: 1
   Issues saltados: 2
   Issues pendientes: 7
   Progreso: 1/10

⏭️  Continuando desde donde se quedó...

[Configuración actualizada]
   Timeout aumentado: 12 minutos (antes: 8)
   Circuit breaker: 2 fallos consecutivos
   Fallos actuales: 0 (reset manual)

[ISSUE 4/10]
→ Auto-selecciona #173 [MEDIA] Add export functionality
→ Implementa → PR #262 → Review ✅ → Merge ✅
→ Duración: 4 minutos
→ Fallos consecutivos: 0/2 (reset)

✅ Issue #173 completado (2/10 total)

💾 Sesión actualizada

[ISSUE 5/10]
→ Auto-selecciona #171 [ALTA] Add real-time notifications (reintento)
→ Implementa con más tiempo...
→ Duración: 11 minutos
→ PR #263 creado
→ Review ✅ → Merge ✅

✅ Issue #171 completado (3/10 total) - Resuelto en reintento

💾 Sesión actualizada

[... Continúa con issues 6-10 ...]

[Mostrar Resumen Final]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA EXITOSAMENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duración total: 3h 25m (incluyendo pausa de 2h)
  ├─ Sesión 1: 14 minutos (1 completado, 2 saltados)
  ├─ Pausa: 2 horas
  └─ Sesión 2: 1h 11m (9 completados, 0 saltados)

📊 ESTADÍSTICAS FINALES:
  Issues procesados:   10/10 (100%)
  ├─ ✅ Completados:   10 (100%)
  ├─ ⚠️ Saltados:      0 (0%)
  └─ ❌ Abortados:     0 (0%)

  PRs creados:         10
  PRs mergeados:       10

  Sesiones:            2
  ├─ Pausas/Reanudaciones: 1
  └─ Circuit breakers:     1 (sesión 1)

⏱️  TIMEOUTS & CIRCUIT BREAKER:
  Sesión 1:
  - Timeout #171 (8 min) → Resuelto en sesión 2 con más tiempo
  - Circuit breaker activado después de 2 fallos

  Sesión 2:
  - Sin timeouts
  - Sin circuit breakers
  - Timeout aumentado a 12 min ayudó con issues complejos

💾 SESIÓN GUARDADA:
  Archivo: .claude/session/workflow-session.json
  Estado: COMPLETADA

📈 LECCIONES APRENDIDAS:
  - Issue #171 requirió 11 minutos (excedió timeout inicial de 8 min)
  - Ajustar --timeout-per-issue según complejidad de issues
  - Circuit breaker previno 8+ issues fallando innecesariamente
  - Persistencia permitió reanudar sin perder progreso

💡 RECOMENDACIÓN PARA PRÓXIMAS SESIONES:
  - Usar --timeout-per-issue=12 para issues complejos
  - Mantener --max-consecutive-failures=2 para protección
  - Siempre usar --save-session en sesiones largas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Ejemplo 8: Modo Autónomo Completo con --autonomous ⭐ (Nuevo - Fase 7)

Muestra cómo usar el alias `--autonomous` para activar todas las características automáticamente:

```
Usuario: /workflow:issue-complete --loop --max=5 --project=7 --autonomous

⚡ MODO AUTÓNOMO ACTIVADO
   Configuración habilitada automáticamente:
   ├─ Auto-selección: ✅
   ├─ Auto-corrección reviews: 2 ciclos
   ├─ Skip on failure: ✅
   ├─ Auto-resolve conflicts: ✅
   ├─ Epic breakdown: ✅
   ├─ Persistencia sesión: ✅
   ├─ Timeout por issue: 10 min
   └─ Circuit breaker: 3 fallos

🚀 Nueva sesión iniciada
   Modo: Autónomo
   Máximo: 5 issues
   Proyecto: #7
   Guardando en: .claude/session/workflow-session.json
   Timeout: 10 minutos por issue
   Circuit breaker: 3 fallos consecutivos

[ISSUE 1/5]
→ Auto-selecciona #180 [ALTA] Refactor authentication
→ Implementa → PR #270 → Review ✅ → Merge ✅
→ Duración: 4 minutos
✅ Issue #180 completado (1/5)
💾 Sesión guardada

[ISSUE 2/5]
→ Auto-selecciona #181 [MEDIA] Add export feature
→ Implementa → PR #271
→ Review: RECHAZADO

🔄 Auto-Corrección: Ciclo 1/2
   → Corrigiendo...
   → Review: APROBADO ✅

✅ Issue #181 completado (2/5) - Auto-corregido
💾 Sesión guardada

[ISSUE 3/5]
→ Auto-selecciona #182 [ALTA] Update dependencies
→ Implementa → PR #272 → Review ✅

⚠️ Conflictos detectados en PR #272

🔧 Estrategia 3: Análisis selectivo
   ✓ Resuelto package.json (usando versión de master)
   ✓ Resuelto package-lock.json (usando versión de master)

✅ Conflictos resueltos, PR mergeado
✅ Issue #182 completado (3/5) - Conflictos resueltos automáticamente
💾 Sesión guardada

[ISSUE 4/5]
→ Auto-selecciona #183 [ALTA] Implement notification system (complejo)
→ Implementa cambios... (muy complejo)
→ Intento 1: Fallo
→ Intento 2: Fallo
→ Intento 3: Fallo

❌ Issue #183 falló después de 3 intentos

🎯 Issue demasiado complejo, convirtiendo a Epic...

✅ Epic creado exitosamente:
   Proyecto: #12 - "Epic: Implement notification system"
   Issue original → Epic #183
   Sub-issues creados: 8

   1. #184 [backend] Create notification model
   2. #185 [backend] Add notification endpoints
   3. #186 [backend] Implement email service
   4. #187 [backend] Add push notification service
   5. #188 [frontend] Create notification UI
   6. #189 [frontend] Add notification hooks
   7. #190 [frontend] Implement notification center
   8. #191 [fullstack] Integration tests

💡 Resolver Epic con:
   /workflow:issue-complete --loop --project=12 --autonomous

⏭️ Continuando con siguiente issue del loop principal...
💾 Sesión guardada

[ISSUE 5/5]
→ Auto-selecciona #192 [MEDIA] Fix user profile bug
→ Implementa → PR #273 → Review ✅ → Merge ✅
→ Duración: 3 minutos
✅ Issue #192 completado (4/5)
💾 Sesión guardada

[Mostrar Resumen Final]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SESIÓN COMPLETADA EXITOSAMENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duración total: 28 minutos

📊 ESTADÍSTICAS FINALES:
  Issues procesados:   5/5 (100%)
  ├─ ✅ Completados:   4 (80%)
  ├─ 🎯 Epic created:  1 (20%)
  ├─ ⚠️ Saltados:      0 (0%)
  └─ ❌ Abortados:     0 (0%)

  PRs creados:         4
  PRs mergeados:       4

🤖 CARACTERÍSTICAS AUTÓNOMAS USADAS:
  Auto-selección:        5/5 issues (100%)
  Auto-corrección:       1 issue (1 review rechazado → corregido)
  Auto-resolve conflicts: 1 issue (dependencies)
  Epic breakdown:        1 issue (complejo → 8 sub-issues)
  Persistencia:          5 saves automáticos
  Timeouts:              0 (todos < 10 min)
  Circuit breaker:       No activado (0 fallos consecutivos)

📋 ISSUES COMPLETADOS:
  1. ✅ #180 [ALTA] Refactor authentication → PR #270 ✅
  2. ✅ #181 [MEDIA] Add export feature → PR #271 ✅ (auto-corregido)
  3. ✅ #182 [ALTA] Update dependencies → PR #272 ✅ (conflicts resolved)
  4. ✅ #192 [MEDIA] Fix user profile bug → PR #273 ✅

🎯 EPICS CREADOS:
  1. Epic #183 → Proyecto #12 "Implement notification system" (8 sub-issues)
     💡 Resolver con: /workflow:issue-complete --loop --project=12 --autonomous

📈 EFECTIVIDAD:
  - 100% de issues procesados sin intervención manual
  - 100% de auto-selecciones exitosas
  - 100% de auto-correcciones exitosas (1/1)
  - 100% de conflictos resueltos automáticamente (1/1)
  - 0 issues perdidos (issue complejo → Epic estructurado)
  - 28 minutos para 4 issues completados + 1 Epic = ~7 min/issue

💡 DESTACADO DEL MODO --autonomous:
  - CERO intervenciones manuales requeridas
  - Issue complejo convertido a Epic (en lugar de saltar)
  - Auto-corrección funcionó perfectamente (1/1)
  - Conflictos de dependencies resueltos automáticamente
  - Sesión persistida permite continuar en cualquier momento

🚀 PRÓXIMOS PASOS SUGERIDOS:

1. Resolver el Epic creado:
   /workflow:issue-complete --loop --project=12 --autonomous

2. Continuar con más issues del proyecto #7:
   /workflow:issue-complete --loop --max=10 --project=7 --autonomous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Comparación con modo manual**:
```
Modo Manual:
  - Tiempo: ~2-3 horas (con preguntas, decisiones)
  - Intervenciones: ~15-20 (selección, correcciones, decisiones)
  - Issues completados: 4
  - Issues perdidos: 1 (complejo, abandonado)

Modo --autonomous:
  - Tiempo: 28 minutos
  - Intervenciones: 0
  - Issues completados: 4
  - Issues perdidos: 0 (→ Epic)

Ahorro: ~85% de tiempo, 100% de issues procesados
```

---

## Notas Importantes

1. **Automatización completa** - El flujo se ejecuta sin intervención del usuario desde el plan
2. **SIEMPRE ejecutar /quality:review** - Es el punto crítico que valida la calidad
3. **NUNCA saltarse la validación** - Garantiza calidad del código
4. **Mantener estado limpio** - Si falla, volver a master
5. **Tracking de sesión** - Mostrar estadísticas al final
6. **Loop opcional** - Permite sesiones largas o cortas
7. **Modo bucle automático** - Usa `--loop` para ejecutar múltiples issues sin intervención
8. **Top 5 issues** - `/github:next` ahora muestra los 5 issues más prioritarios (antes 3)
9. **Detener bucle** - Usuario puede escribir "detener" en cualquier momento para pausar
10. **Límite de issues** - Usa `--max=N` para limitar el número de issues en modo bucle
11. **Filtro de proyecto** - Usa `--project=N` para trabajar solo en issues del proyecto de GitHub #N
12. **Combinar filtros** - Se pueden combinar `--loop`, `--max=N` y `--project=N` simultáneamente
13. **Auto-corrección de code reviews (Fase 4)** - Usa `--auto-fix-reviews=N` para permitir hasta N ciclos de corrección automática cuando el review es rechazado
14. **Auto-resolución de conflictos (Fase 5)** - Usa `--auto-resolve-conflicts` para intentar resolver conflictos de merge automáticamente con estrategias progresivas (rebase, merge ours, selectiva)
15. **Persistencia de sesión (Fase 6)** - Usa `--save-session` para guardar progreso después de cada issue, permite pausar y reanudar con `--resume=<path>`
16. **Timeouts por issue (Fase 6)** - Usa `--timeout-per-issue=N` (minutos) para prevenir bloqueos indefinidos en issues problemáticos (default: 10 en modo autónomo)
17. **Circuit breaker (Fase 6)** - Usa `--max-consecutive-failures=N` para detener el workflow después de N fallos consecutivos y prevenir loops infinitos (default: 3 en modo autónomo)

---

## Integración con Otros Skills

Este comando orquesta:
- `/github:next` → Seleccionar y preparar
- `/github:pr` → Crear PR
- `/quality:review` → Code review
- `/github:merge` → Mergear
- `issue-planner` agent → Plan de implementación

Todos son invocados automáticamente en el orden correcto.
