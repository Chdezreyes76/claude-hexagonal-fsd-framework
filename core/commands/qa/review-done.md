---
description: Revisar automáticamente todos los issues en Done de un proyecto y crear issues por errores detectados
disable-model-invocation: false
allowed-tools: Skill, Bash(gh:*)
---

# QA Review Done

Revisa automáticamente todos los issues en columna "Done" de un proyecto GitHub, ejecuta verificaciones exhaustivas, y crea issues automáticamente por cada error detectado.

## Sintaxis

```bash
/qa-review-done --project=<numero> [opciones]
```

## Argumentos

### Requeridos
- `--project=<numero>` - Número del proyecto GitHub

### Filtrado
- `--issue=<numero>` - Revisar un solo issue específico
- `--issues=<n1,n2,n3>` - Revisar múltiples issues (separados por coma)

### Control de Verificación
- `--skip-browser` - Omitir verificación en navegador (solo TypeScript y archivos)
- `--skip-typescript` - Omitir compilación TypeScript
- `--skip-files` - Omitir verificación de archivos
- `--only-critical` - Solo reportar errores críticos (omitir warnings)

### Control de Acciones
- `--dry-run` - Simular sin mover issues ni crear issues de errores
- `--no-create-issues` - No crear issues automáticamente, solo reportar
- `--no-move` - No mover a Reviewed (solo verificar)
- `--auto-assign` - Auto-asignar issues creados al assignee del issue original

### Output
- `--verbose` - Output detallado con logs completos
- `--quiet` - Solo mostrar resumen final
- `--report=<path>` - Guardar reporte en archivo (default: .claude/qa-reports/)
- `--no-report` - No crear archivos de reporte, solo estadística final

### Performance
- `--timeout=<seconds>` - Timeout por issue (default: 300)
- `--parallel=<n>` - Issues a verificar en paralelo (default: 1)

## Ejemplos

```bash
# Básico
/qa-review-done --project=7

# Rápido sin reportes
/qa-review-done --project=7 --skip-browser --no-report

# Un issue específico
/qa-review-done --project=7 --issue=142

# Dry run
/qa-review-done --project=7 --dry-run --verbose
```

## Instrucciones

### 1. Parsear y validar argumentos

```javascript
const args = $ARGUMENTS

// Proyecto (requerido)
const projectMatch = args.match(/--project=(\d+)/)
if (!projectMatch) {
  console.log('❌ Error: Debes especificar --project=<numero>')
  console.log('Ejemplo: /qa-review-done --project=7')
  console.log('\nProyectos disponibles:')
  const projectsList = await Bash('gh project list --owner {{githubOwner}} --format json')
  JSON.parse(projectsList).forEach(p => {
    console.log(`  #${p.number} - ${p.title}`)
  })
  return
}

// Filtrado
const issueMatch = args.match(/--issue=(\d+)/)
const issuesMatch = args.match(/--issues=([\d,]+)/)

// Control de verificación
const skipBrowser = args.includes('--skip-browser')
const skipTypescript = args.includes('--skip-typescript')
const skipFiles = args.includes('--skip-files')
const onlyCritical = args.includes('--only-critical')

// Control de acciones
const dryRun = args.includes('--dry-run')
const noCreateIssues = args.includes('--no-create-issues')
const noMove = args.includes('--no-move')
const autoAssign = args.includes('--auto-assign')

// Output
const verbose = args.includes('--verbose')
const quiet = args.includes('--quiet')
const reportMatch = args.match(/--report=(.+?)(?:\s|$)/)
const noReport = args.includes('--no-report')

// Performance
const timeoutMatch = args.match(/--timeout=(\d+)/)
const parallelMatch = args.match(/--parallel=(\d+)/)

// Validar combinaciones incompatibles
if (verbose && quiet) {
  console.log('❌ Error: --verbose y --quiet son incompatibles')
  return
}

if (reportMatch && noReport) {
  console.log('❌ Error: --report y --no-report son incompatibles')
  return
}

console.log(`🔍 Iniciando QA Review - Proyecto #${projectMatch[1]}`)
if (dryRun) console.log('⚠️  DRY RUN - No se harán cambios')
```

### 2. Invocar skill qa:review-done

```javascript
await Skill('qa:review-done', {
  // Requerido
  projectNumber: projectMatch[1],

  // Filtrado
  issue: issueMatch ? issueMatch[1] : null,
  issues: issuesMatch ? issuesMatch[1].split(',') : null,

  // Control de verificación
  skipBrowser,
  skipTypescript,
  skipFiles,
  onlyCritical,

  // Control de acciones
  dryRun,
  noCreateIssues,
  noMove,
  autoAssign,

  // Output
  verbose,
  quiet,
  reportPath: reportMatch ? reportMatch[1] : null,
  noReport,

  // Performance
  timeout: timeoutMatch ? parseInt(timeoutMatch[1]) : 300,
  parallel: parallelMatch ? parseInt(parallelMatch[1]) : 1
})
```

El skill `qa:review-done` se encarga de toda la lógica de verificación, creación de issues y reportes.

## Ver También

- Skill `qa:review-done` - Documentación completa de verificaciones y lógica
- `/quality:review` - Revisar código antes de commit
- `/github:issue` - Crear issue manualmente
