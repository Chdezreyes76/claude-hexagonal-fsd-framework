---
description: Convertir un issue complejo en un proyecto Epic con sub-issues manejables
allowed-tools: Task, Read, Bash(gh:*), Bash(git:*), Write
---

# GitHub Epic Breakdown for $ARGUMENTS

Convierte un issue complejo que no puede resolverse automáticamente en un Epic estructurado con sub-issues manejables.

## Propósito

Cuando un issue es demasiado complejo para implementación automática (falla después de 3 reintentos), en lugar de saltarlo y perderlo, este comando:

1. **Analiza** el issue complejo con el agente issue-planner
2. **Crea** un nuevo proyecto de GitHub para el Epic
3. **Convierte** el issue original en Epic
4. **Genera** sub-issues manejables (cada uno ≤ 30 min estimado)
5. **Vincula** todos los sub-issues al Epic
6. **Retorna** información para resolver el Epic en otro loop

**Resultado**: 0% de issues perdidos - todo se resuelve eventualmente.

---

## Sintaxis

```bash
/github:epic-breakdown <issue-number>
```

**Argumentos**:
- `<issue-number>`: Número del issue complejo a convertir en Epic

**Ejemplos**:
```bash
/github:epic-breakdown 150
/github:epic-breakdown 142
```

---

## Proceso Detallado

### PASO 1: Analizar Issue Complejo

1. **Obtener información del issue**:
   ```bash
   gh issue view <issue-number> --json number,title,body,labels
   ```

2. **Leer contenido completo**:
   - Título del issue
   - Descripción/body completo
   - Labels actuales
   - Archivos mencionados (si los hay)
   - Comentarios relevantes

**Output esperado**: JSON con toda la información del issue

---

### PASO 2: Generar Plan de Breakdown

Usar el agente `issue-planner` para analizar y dividir el issue:

```typescript
const plan = await Task({
  subagent_type: 'issue-planner',
  prompt: `Analiza este issue complejo y divídelo en sub-tareas manejables.

Issue #${issueNumber}: ${issueTitle}

Descripción:
${issueBody}

INSTRUCCIONES:
1. Divide el issue en sub-tareas de 20-30 minutos cada una
2. Cada sub-tarea debe ser independiente y clara
3. Ordena las sub-tareas por dependencias lógicas
4. Identifica el tipo de cada sub-tarea (backend, frontend, fullstack, docs, tests)
5. Asigna prioridades (high, medium, low)

OUTPUT REQUERIDO:
Array JSON de sub-tareas con este formato:
[
  {
    "title": "Backend: Crear modelo User",
    "description": "Crear entidad User con campos...",
    "type": "backend",
    "priority": "high",
    "estimatedMinutes": 20,
    "dependencies": []
  },
  ...
]`
})
```

**Validar plan**:
- Mínimo 3 sub-tareas
- Máximo 15 sub-tareas
- Cada una con título y descripción claros
- Tipos válidos: backend, frontend, fullstack, docs, tests

**Output esperado**: Array de sub-tareas validado

---

### PASO 3: Crear Proyecto en GitHub

Crear un nuevo proyecto de GitHub para el Epic:

```bash
gh project create \
  --owner {{githubOwner}} \
  --title "Epic: ${issueTitle}" \
  --format json
```

**Parsear output** para obtener el número de proyecto:
```javascript
const output = JSON.parse(result)
const projectNumber = output.number
const projectUrl = output.url
```

**Output esperado**: Proyecto #N creado con título "Epic: ${issueTitle}"

---

### PASO 4: Mover Issue Original al Proyecto

1. **Agregar issue original al proyecto**:
   ```bash
   gh project item-add {{projectNumber}} \
     --owner {{githubOwner}} \
     --url https://github.com/{{githubOwner}}/{{githubRepo}}/issues/{{issueNumber}}
   ```

2. **Actualizar issue original con label y título**:
   ```bash
   # Agregar label "type: epic"
   gh issue edit {{issueNumber}} \
     --add-label "type: epic"

   # Opcional: Actualizar título para indicar que es Epic
   # gh issue edit {{issueNumber}} \
   #   --title "Epic: ${originalTitle}"
   ```

3. **Agregar comentario al issue original**:
   ```bash
   gh issue comment {{issueNumber}} --body "$(cat <<'EOF'
📋 Este issue ha sido convertido en un Epic y dividido en sub-issues manejables.

**Proyecto Epic**: https://github.com/{{githubOwner}}/{{githubRepo}}/projects/{{projectNumber}}

Se han creado {{subIssuesCount}} sub-issues para resolver este Epic de forma estructurada.

Resolver con:
\`\`\`bash
/workflow:issue-complete --loop --project={{projectNumber}} --autonomous
\`\`\`
EOF
)"
   ```

**Output esperado**: Issue agregado al proyecto, label "type: epic" añadido, comentario agregado

---

### PASO 5: Crear Sub-Issues

Para cada sub-tarea del plan, crear un issue en GitHub:

```javascript
for (let i = 0; i < subTasks.length; i++) {
  const subTask = subTasks[i]

  // Crear issue
  const issueBody = `Part of Epic #${epicNumber}

${subTask.description}

---

**Type**: ${subTask.type}
**Estimated time**: ~${subTask.estimatedMinutes} minutes
**Dependencies**: ${subTask.dependencies.join(', ') || 'None'}

Related to #${epicNumber}
`

  const command = `gh issue create \\
    --title "${subTask.title}" \\
    --body "${issueBody}" \\
    --label "epic: ${epicNumber}" \\
    --label "type: ${subTask.type}" \\
    --label "priority: ${subTask.priority}" \\
    --project ${projectNumber} \\
    --format json`

  const result = await Bash(command)
  const newIssue = JSON.parse(result)

  console.log(`✅ Created sub-issue #${newIssue.number}: ${subTask.title}`)

  subIssuesCreated.push({
    number: newIssue.number,
    title: subTask.title,
    type: subTask.type,
    priority: subTask.priority
  })
}
```

**Labels aplicados a cada sub-issue**:
- `epic: ${epicNumber}` - Vincula al Epic padre
- `type: ${subTask.type}` - backend, frontend, fullstack, docs, tests
- `priority: ${subTask.priority}` - high, medium, low

**Output esperado**: N sub-issues creados, todos vinculados al Epic y al proyecto

---

### PASO 6: Configurar Proyecto

El proyecto se crea automáticamente con columnas por defecto, pero podemos verificar:

```bash
gh project field-list {{projectNumber}} --owner {{githubOwner}}
```

**Columnas esperadas** (creadas por defecto en GitHub Projects V2):
- Backlog
- Todo / In Progress
- Done
- Reviewed (puede no existir, depende de template)

**Nota**: No es necesario configurar columnas manualmente, GitHub Projects V2 las crea automáticamente.

---

### PASO 7: Generar Reporte

Crear un reporte Markdown en `.claude/epics/epic-${epicNumber}.md`:

```markdown
# Epic #${epicNumber}: ${issueTitle}

**Created**: ${new Date().toISOString()}
**Project**: #${projectNumber} - https://github.com/{{githubOwner}}/{{githubRepo}}/projects/${projectNumber}
**Original Issue**: #${epicNumber} - https://github.com/{{githubOwner}}/{{githubRepo}}/issues/${epicNumber}

## Summary

Este Epic fue creado automáticamente porque el issue original era demasiado complejo para implementación automática.

**Razón**: ${failureReason}
**Intentos fallidos**: 3

## Sub-Issues Created

Total: ${subIssuesCreated.length}

${subIssuesCreated.map((issue, idx) => `
${idx + 1}. **#${issue.number}** - ${issue.title}
   - Type: ${issue.type}
   - Priority: ${issue.priority}
   - Link: https://github.com/{{githubOwner}}/{{githubRepo}}/issues/${issue.number}
`).join('\n')}

## Breakdown Plan

${JSON.stringify(subTasks, null, 2)}

## Next Steps

Para resolver este Epic automáticamente:

\`\`\`bash
/workflow:issue-complete --loop --project=${projectNumber} --autonomous
\`\`\`

Este comando ejecutará todos los sub-issues del proyecto en modo autónomo.

## Progress Tracking

- [ ] Epic creado y configurado
- [ ] Sub-issues generados (${subIssuesCreated.length})
- [ ] Proyecto GitHub configurado
- [ ] Resolver sub-issues (0/${subIssuesCreated.length})
- [ ] Cerrar Epic #${epicNumber}
```

**Guardar reporte**:
```javascript
const reportPath = `.claude/epics/epic-${epicNumber}.md`
await Write(reportPath, reportContent)
```

**Output esperado**: Reporte generado en `.claude/epics/epic-${epicNumber}.md`

---

### PASO 8: Output Final

Retornar información estructurada en JSON:

```json
{
  "status": "success",
  "epicNumber": 150,
  "epicTitle": "Implementar sistema de autenticación completo",
  "projectNumber": 8,
  "projectTitle": "Epic: Implementar sistema de autenticación completo",
  "projectUrl": "https://github.com/owner/repo/projects/8",
  "subIssues": [
    {"number": 151, "title": "Backend: Crear modelo User", "type": "backend", "priority": "high"},
    {"number": 152, "title": "Backend: Implementar JWT tokens", "type": "backend", "priority": "high"},
    {"number": 153, "title": "Backend: Endpoints login/logout", "type": "backend", "priority": "high"},
    {"number": 154, "title": "Frontend: Formulario de login", "type": "frontend", "priority": "medium"},
    {"number": 155, "title": "Frontend: Context de autenticación", "type": "frontend", "priority": "medium"},
    {"number": 156, "title": "Tests: Tests unitarios backend", "type": "backend", "priority": "low"}
  ],
  "totalSubIssues": 6,
  "estimatedTime": "~2.5 horas total",
  "reportPath": ".claude/epics/epic-150.md"
}
```

**Mostrar resumen al usuario**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EPIC CREATED SUCCESSFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Epic #150: Implementar sistema de autenticación completo

📦 Proyecto creado: #8
   https://github.com/owner/repo/projects/8

📋 Sub-issues creados: 6
   1. #151 [backend] Backend: Crear modelo User
   2. #152 [backend] Backend: Implementar JWT tokens
   3. #153 [backend] Backend: Endpoints login/logout
   4. #154 [frontend] Frontend: Formulario de login
   5. #155 [frontend] Frontend: Context de autenticación
   6. #156 [backend] Tests: Tests unitarios backend

⏱️  Tiempo estimado: ~2.5 horas total

💾 Reporte guardado: .claude/epics/epic-150.md

🚀 Para resolver este Epic automáticamente:
   /workflow:issue-complete --loop --project=8 --autonomous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Integración con workflow:issue-complete

Este comando es invocado automáticamente por `/workflow:issue-complete` cuando:

1. El agente implementador falla después de 3 reintentos
2. El workflow está en modo `--autonomous` o `--epic-breakdown-on-failure`

**Uso desde workflow**:

Cuando el workflow `/workflow:issue-complete` detecta que un issue es demasiado complejo (falla después de 3 reintentos), automáticamente:

1. **Detecta el fallo**: `implementer.status === 'failed' && implementer.attempts >= 3`
2. **Verifica modo autónomo**: Si `--autonomous` o `--epic-breakdown-on-failure` está habilitado
3. **Ejecuta este command**: `/github:epic-breakdown <issue-number>`
4. **Procesa el resultado**:
   - Epic creado en Proyecto #N
   - X sub-issues generados
   - Muestra comando para resolver: `/workflow:issue-complete --loop --project=N --autonomous`
5. **Registra en sesión**: Guarda información del Epic para reporte final
6. **Continúa con siguiente issue** del loop principal

**Ejemplo de flujo**:
```
[ISSUE 5/20]
→ Intentando implementar #150...
❌ Fallo (intento 1/3)
❌ Fallo (intento 2/3)
❌ Fallo (intento 3/3)

→ Issue demasiado complejo
→ Ejecutando /github:epic-breakdown 150...

✅ Epic creado: Proyecto #8
   Sub-issues: 6
   Resolver con: /workflow:issue-complete --loop --project=8 --autonomous

→ Continuando con issue #149...
```

---

## Manejo de Errores

### Error: Issue no existe
```
❌ Error: Issue #${issueNumber} no encontrado

Verifica el número de issue y vuelve a intentar.
```

### Error: Issue ya es un Epic
```
⚠️  Warning: Issue #${issueNumber} ya tiene label "type: epic"

¿Continuar de todas formas? (s/n)
```

### Error: Fallo al crear proyecto
```
❌ Error al crear proyecto en GitHub

Detalles: ${error}

Opciones:
  1. reintentar - Volver a intentar crear proyecto
  2. manual - Crear proyecto manualmente
  3. salir - Cancelar epic-breakdown
```

### Error: Análisis del issue-planner falla
```
❌ Error: No se pudo generar plan de breakdown

El issue puede ser demasiado vago o no tener suficiente información.

Recomendación: Agregar más detalles al issue y volver a intentar.
```

---

## Casos de Uso

### Caso 1: Issue Complejo en Workflow Autónomo

```bash
Usuario: /workflow:issue-complete --loop --max=10 --autonomous

[ISSUE 1/10]
→ Issue #150: Implementar sistema de autenticación completo
→ Intentando implementación automática...
❌ Fallo (intento 1/3)
❌ Fallo (intento 2/3)
❌ Fallo (intento 3/3)

→ Issue demasiado complejo, convirtiendo a Epic...
→ /github:epic-breakdown 150

✅ Epic creado: Proyecto #8 con 6 sub-issues
→ Continuando con siguiente issue...

[ISSUE 2/10]
→ Procesa issue #149 (más simple)
...

[Al final de la sesión]
📊 RESULTADOS:
  Issues completados:   8 (80%)
  Epics creados:        1 (Proyecto #8)
  Issues saltados:      1 (10%)

💡 Para resolver el Epic #150:
   /workflow:issue-complete --loop --project=8 --autonomous
```

### Caso 2: Uso Manual

```bash
Usuario: /github:epic-breakdown 150

[Análisis del issue...]
[Generación de plan...]
[Creación de proyecto...]
[Creación de sub-issues...]

✅ Epic creado exitosamente
   Proyecto #8 con 10 sub-issues

Usuario: /workflow:issue-complete --loop --project=8 --autonomous

[Resuelve los 10 sub-issues automáticamente...]

✅ Todos los sub-issues completados
   Epic #150 puede cerrarse ahora
```

---

## Notas Importantes

1. **No se pierden issues** - Epic breakdown convierte complejidad en estructura manejable
2. **Siempre generar reporte** - Documentación completa del breakdown
3. **Validar plan** - Mínimo 3, máximo 15 sub-issues
4. **Vincular correctamente** - Usar labels `epic: ${epicNumber}` en todos los sub-issues
5. **Proyecto separado** - Permite resolver el Epic en un loop independiente
6. **Tracking completo** - Guardar información para reporte final de sesión
7. **Reusable** - Puede usarse manualmente para cualquier issue complejo

---

## Ver También

- `/workflow:issue-complete` - Workflow que invoca epic-breakdown automáticamente
- `/github:start` - Iniciar trabajo en un issue
- `/github:pr` - Crear Pull Request
- `issue-planner` agent - Genera planes de implementación
