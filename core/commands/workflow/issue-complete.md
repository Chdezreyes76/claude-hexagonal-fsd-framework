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

**Parámetros disponibles**:
- `--loop`: Activa modo bucle automático
- `--max=N`: Limita a N issues como máximo
- `--project=N`: Filtra solo issues del proyecto de GitHub #N

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

### Sin filtro de proyecto

Ejecutar el skill `/github:next`:

```typescript
Skill("github:next")
```

Esto automáticamente:
- Analiza issues por prioridad
- Muestra top 5 más urgentes
- Pregunta cuál resolver
- Crea rama e inicia trabajo
- Obtiene plan del issue-planner

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

4. **Continuar flujo normal**:
   - Mostrar top 5 del proyecto
   - Ejecutar Skill("github:next") con el issue seleccionado

**Output esperado**: Branch creada, issue asignado del proyecto especificado, plan mostrado

---

## PASO 2: Implementación Automática

Una vez se obtiene el plan del issue-planner, se ejecuta automáticamente:

- El agente especializado (backend-implementer, frontend-implementer o fullstack-implementer) inicia la implementación
- Ejecuta todos los cambios requeridos según el plan
- Realiza commits automáticamente siguiendo las convenciones del proyecto
- Completa la implementación sin intervención del usuario

**Output esperado**: Cambios implementados, commits realizados, rama actualizada

---

## PASO 3: Crear Pull Request

Una vez la implementación automática se completa, ejecutar:

```typescript
Skill("github:pr")
```

Esto automáticamente:
- Hace push de la rama
- Crea PR con descripción auto-generada
- Vincula al issue

**Output esperado**: PR creado con número

---

## PASO 4: Code Review ⭐ CRÍTICO

**ESTE ES EL PASO MÁS IMPORTANTE** - Nunca debe olvidarse.

Ejecutar el skill de code review:

```typescript
Skill("quality:review")
```

Esto ejecuta el agente `code-reviewer` que valida:
- ✅ Feature-Sliced Design respetado
- ✅ TypeScript sin errores
- ✅ Conventional Commits
- ✅ Type safety correcto
- ✅ No duplicación de código
- ✅ Tests agregados (si aplica)

**Resultado**: APROBADO o RECHAZADO

### Si APROBADO:
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

### Si RECHAZADO:
```
❌ Code Review: RECHAZADO

Problemas encontrados:
  ✗ TypeScript error en línea 42: unused variable
  ✗ FSD violation: import desde @/services en pages/
  ✗ Missing test para nueva funcionalidad

¿Qué quieres hacer?
  1. "arreglar" → Volver a implementar y re-revisar
  2. "salir"   → Cancelar workflow
  3. "forzar"  → Mergear de todas formas (NO RECOMENDADO)
```

**Usar AskUserQuestion** para decidir:
- Si "arreglar": Volver a PASO 2
- Si "salir": Cancelar workflow, volver a master
- Si "forzar": Mostrar warning y continuar a PASO 5

---

## PASO 5: Mergear PR

Si el review fue aprobado, ejecutar:

```typescript
Skill("github:merge")
```

Esto automáticamente:
- Mergea PR a master
- Limpia ramas locales y remotas
- Hace pull de cambios
- Vuelve a master

**Output esperado**: PR mergeado, rama limpiada, en master

---

## PASO 6: Siguiente Issue (Loop)

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

// Ejecutar recursivamente
Skill("github:next")
// Continuar con el flujo...
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

  // Estado
  issuenActual: null,
  tiempoInicio: Date.now(),

  // Configuración de bucle
  loopMode: false,           // true si se ejecutó con --loop
  maxIssues: null,           // null = infinito, o número si se especificó --max
  projectNumber: null,       // null = todos los issues, o número de proyecto si se especificó --project
  shouldContinue: true,      // false si usuario pide detener

  // Lista de issues completados (para resumen final)
  issuesCompletados: []      // [{number, title, pr, time}]
}
```

**Detectar flags en $ARGUMENTS**:
- Si contiene "--loop" → `session.loopMode = true`
- Si contiene "--max=N" → `session.maxIssues = N`
- Si contiene "--project=N" → `session.projectNumber = N`

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
→ Skill("github:next")
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
→ Skill("github:pr")
→ PR #209 creado

[PASO 4: Review ⭐]
→ Skill("quality:review")
→ APROBADO ✅

[PASO 5: Merge]
→ Skill("github:merge")
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
→ Skill("github:next") automático
→ Selecciona #215 (más prioritario)
→ Implementa → PR #227 → Review ✅ → Merge ✅
→ "✅ Issue #215 completado (1/3)"
→ Espera 2 segundos...
→ Continúa automáticamente

[ISSUE 2/3]
→ Skill("github:next") automático
→ Selecciona #214
→ Implementa → PR #226 → Review ✅ → Merge ✅
→ "✅ Issue #214 completado (2/3)"
→ Espera 2 segundos...
→ Continúa automáticamente

[ISSUE 3/3]
→ Skill("github:next") automático
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

---

## Integración con Otros Skills

Este comando orquesta:
- `/github:next` → Seleccionar y preparar
- `/github:pr` → Crear PR
- `/quality:review` → Code review
- `/github:merge` → Mergear
- `issue-planner` agent → Plan de implementación

Todos son invocados automáticamente en el orden correcto.
