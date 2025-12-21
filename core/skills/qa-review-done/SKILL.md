---
name: qa:review-done
description: Revisar automáticamente todos los issues en Done de un proyecto y moverlos a Reviewed si pasan QA. Envía email con resumen al completar.
allowed-tools: Read, Glob, Grep, Bash(gh:*), Bash(cd:*), Bash(npx:*), Bash(curl:*), MCPSearch, mcp__playwright__browser_navigate, mcp__playwright__browser_click, mcp__playwright__browser_snapshot, mcp__playwright__browser_console_messages, mcp__playwright__browser_take_screenshot
agent-type: qa-validator
retry-attempts: 0
---

# QA Review Done - Automated Issue Verification

Agente autónomo que revisa y verifica todos los issues en columna "Done" de un proyecto GitHub, ejecutando validaciones de QA completas y moviendo issues aprobados a "Reviewed".

## Uso

```bash
/qa:review-done <numero-proyecto>
# Ejemplo: /qa:review-done 7
```

## Responsabilidades

1. ✅ Obtener todos los issues en columna "Done" del proyecto especificado
2. ✅ Para cada issue:
   - Leer descripción y criterios de aceptación
   - Verificar archivos mencionados existen y tienen cambios correctos
   - Ejecutar compilación TypeScript (frontend)
   - Abrir navegador y navegar a páginas relevantes
   - Capturar y analizar errores de consola
   - Tomar screenshots como evidencia
3. ✅ Mover issues aprobados a columna "Reviewed"
4. ✅ Generar reporte detallado con estadísticas
5. ✅ **Enviar email a {{userEmail}} con resumen**

## Proceso de Verificación por Issue

### PASO 1: Obtener Issues en Done

```bash
# Consultar GitHub GraphQL API
gh api graphql -f query='
query {
  node(id: "PROJECT_ID") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue {
              number
              title
              body
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
}'
```

**Output esperado:**
```json
{
  "issues_in_done": [
    {"number": 210, "title": "refactor(entities): crear estructura usuario entity"},
    {"number": 211, "title": "refactor(entities): crear estructura centros-coste entity"},
    ...
  ]
}
```

### PASO 2: Verificación Individual por Issue

Para cada issue en Done, ejecutar:

#### A. Leer y Analizar Issue

```bash
gh issue view <numero> --json number,title,body
```

**Analizar:**
- Descripción del cambio
- Archivos modificados mencionados
- Criterios de aceptación
- Tipo de cambio (backend/frontend/fullstack)

#### B. Verificar Archivos Existen

```bash
# Si el issue menciona archivos, verificarlos
# Ejemplo: "frontend/src/entities/usuario/api/usuario-api.ts"
ls -la frontend/src/entities/usuario/api/usuario-api.ts
```

**Verificar:**
- ✅ Archivos mencionados existen
- ✅ No hay imports rotos de @/services
- ✅ Estructura correcta según FSD

#### C. Compilación TypeScript

```bash
cd frontend
npx tsc --noEmit
```

**Criterio:**
- ✅ PASS: Sin errores de compilación
- ❌ FAIL: Errores de tipos → Mantener en Done

#### D. Verificación en Navegador

```javascript
// 1. Navegar a localhost:3000
await mcp__playwright__browser_navigate({ url: "http://localhost:3000" })

// 2. Identificar páginas relevantes según issue
// Ejemplo: Issue sobre usuarios → navegar a /settings y click "Usuarios"

// 3. Tomar snapshot de la página
await mcp__playwright__browser_snapshot()

// 4. Capturar errores de consola
await mcp__playwright__browser_console_messages({ level: "error" })

// 5. Tomar screenshot como evidencia
await mcp__playwright__browser_take_screenshot()
```

**Criterios:**
- ✅ PASS: 0 errores de consola
- ❌ FAIL: Errores en consola → Mantener en Done

### PASO 3: Decisión y Acción

#### ✅ SI TODAS LAS VERIFICACIONES PASAN:

```json
{
  "issue": 210,
  "status": "PASSED",
  "checks": {
    "files_exist": true,
    "typescript_compilation": "passed",
    "browser_errors": 0,
    "screenshots_taken": 2
  },
  "action": "MOVE_TO_REVIEWED"
}
```

**Ejecutar:**
```bash
# Mover a columna Reviewed
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: "PROJECT_ID"
      itemId: "ITEM_ID"
      fieldId: "STATUS_FIELD_ID"
      value: { singleSelectOptionId: "REVIEWED_OPTION_ID" }
    }
  ) {
    projectV2Item { id }
  }
}'
```

#### ❌ SI ALGUNA VERIFICACIÓN FALLA:

```json
{
  "issue": 210,
  "status": "FAILED",
  "checks": {
    "files_exist": true,
    "typescript_compilation": "failed",
    "errors": [
      "Property 'nombre' does not exist on type 'Usuario'"
    ]
  },
  "action": "KEEP_IN_DONE",
  "reason": "TypeScript compilation errors"
}
```

**Acción:** Mantener en Done y registrar en reporte

### PASO 4: Generar Reporte Completo

```markdown
# QA Review Report - Project #7
**Fecha:** 2025-12-20 15:30:00
**Proyecto:** Revisión de Calidad - Frontend

## Resumen Ejecutivo
- ✅ Issues Verificados: 12/15
- ✅ Movidos a Reviewed: 12
- ❌ Mantenidos en Done: 3
- ⏱️  Tiempo Total: 8 minutos

## Issues Verificados ✅

### #210 - refactor(entities): crear estructura usuario entity
- ✅ Archivos verificados: 3/3
- ✅ TypeScript: Sin errores
- ✅ Browser: 0 errores consola
- ✅ Screenshots: 2
- 🟢 **MOVED TO REVIEWED**

### #211 - refactor(entities): crear estructura centros-coste entity
- ✅ Archivos verificados: 5/5
- ✅ TypeScript: Sin errores
- ✅ Browser: 0 errores consola
- ✅ Screenshots: 4
- 🟢 **MOVED TO REVIEWED**

... (continúa para todos los issues aprobados)

## Issues con Problemas ❌

### #216 - fix(types): corregir tipos en Usuario
- ❌ TypeScript: 2 errores
  - Property 'nombre' does not exist on type 'Usuario' (line 42)
  - Type 'string' is not assignable to type 'RolUsuario' (line 67)
- 🔴 **KEPT IN DONE**
- 📋 Acción requerida: Corregir errores de tipos

### #217 - feat(ui): añadir modal de confirmación
- ❌ Browser: 1 error de consola
  - "Uncaught TypeError: Cannot read property 'id' of undefined"
  - Source: ConfirmModal.tsx:89
- 🔴 **KEPT IN DONE**
- 📋 Acción requerida: Corregir error en ConfirmModal

... (continúa para issues con problemas)

## Estadísticas Detalladas

| Categoría | Total | Pasaron | Fallaron |
|-----------|-------|---------|----------|
| Verificación de archivos | 15 | 15 | 0 |
| Compilación TypeScript | 15 | 13 | 2 |
| Errores de consola | 15 | 13 | 2 |
| Screenshots capturados | - | 45 | - |

## Próximos Pasos

1. Revisar y corregir issue #216 (errores TypeScript)
2. Revisar y corregir issue #217 (error browser)
3. Revisar y corregir issue #218 (error linting)
4. Re-ejecutar QA review cuando estén corregidos

---
**Generado automáticamente por QA Review Agent**
```

### PASO 5: Enviar Email con Resumen

```bash
# Preparar contenido del email
EMAIL_SUBJECT="QA Review Completado - Proyecto #7"
EMAIL_TO="{{userEmail}}"

# Generar HTML del email
cat > /tmp/qa_email.html <<EOF
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #4CAF50; color: white; padding: 20px; }
    .summary { background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .success { color: #4CAF50; }
    .error { color: #f44336; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ QA Review Completado</h1>
    <p>Proyecto #7 - Revisión de Calidad Frontend</p>
  </div>

  <div class="summary">
    <h2>Resumen Ejecutivo</h2>
    <p><span class="success">✅ Issues Verificados: 12/15</span></p>
    <p><span class="success">✅ Movidos a Reviewed: 12</span></p>
    <p><span class="error">❌ Mantenidos en Done: 3</span></p>
    <p>⏱️ Tiempo Total: 8 minutos</p>
  </div>

  <h2>Issues Aprobados ✅</h2>
  <ul>
    <li>#210 - refactor(entities): crear estructura usuario entity</li>
    <li>#211 - refactor(entities): crear estructura centros-coste entity</li>
    <li>... (lista completa)</li>
  </ul>

  <h2>Issues con Problemas ❌</h2>
  <table>
    <tr>
      <th>Issue</th>
      <th>Título</th>
      <th>Error</th>
      <th>Acción Requerida</th>
    </tr>
    <tr>
      <td>#216</td>
      <td>fix(types): corregir tipos</td>
      <td>2 errores TypeScript</td>
      <td>Corregir tipos en Usuario</td>
    </tr>
    <tr>
      <td>#217</td>
      <td>feat(ui): añadir modal</td>
      <td>Error consola browser</td>
      <td>Corregir ConfirmModal.tsx:89</td>
    </tr>
  </table>

  <h2>Próximos Pasos</h2>
  <ol>
    <li>Corregir issue #216 (TypeScript errors)</li>
    <li>Corregir issue #217 (Browser error)</li>
    <li>Corregir issue #218 (Linting)</li>
    <li>Re-ejecutar /qa:review-done 7</li>
  </ol>

  <hr>
  <p style="color: #666; font-size: 12px;">
    Generado automáticamente por QA Review Agent<br>
    Fecha: $(date +"%Y-%m-%d %H:%M:%S")
  </p>
</body>
</html>
EOF

# Enviar email usando curl con servicio SMTP
# Opción 1: Si tienes configurado sendmail/mailx
echo "$(cat /tmp/qa_email.html)" | mail -s "$EMAIL_SUBJECT" -a "Content-Type: text/html" $EMAIL_TO

# Opción 2: Si usas API de email (ej: SendGrid, Mailgun)
# curl -X POST https://api.sendgrid.com/v3/mail/send \
#   -H "Authorization: Bearer $SENDGRID_API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "personalizations": [{"to": [{"email": "{{userEmail}}"}]}],
#     "from": {"email": "qa-bot@gextiona.com"},
#     "subject": "QA Review Completado - Proyecto #7",
#     "content": [{"type": "text/html", "value": "'"$(cat /tmp/qa_email.html)"'"}]
#   }'

# Opción 3: Usar servicio local SMTP
# echo "$(cat /tmp/qa_email.html)" | \
#   curl --url 'smtp://smtp.gmail.com:587' \
#     --ssl-reqd \
#     --mail-from 'qa-bot@gextiona.com' \
#     --mail-rcpt '{{userEmail}}' \
#     --user 'qa-bot@gextiona.com:password' \
#     --upload-file -

echo "✅ Email enviado a {{userEmail}}"
```

## Casos Especiales

### 1. Proyecto sin Issues en Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  NO ISSUES TO REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proyecto #7: Revisión de Calidad - Frontend
Issues en columna "Done": 0

✅ Todos los issues ya han sido revisados
No hay trabajo pendiente de QA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Acción:** No enviar email

### 2. Todos los Issues Aprobados

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL ISSUES APPROVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proyecto #7
✅ Verificados: 15/15
✅ Movidos a Reviewed: 15
❌ Con problemas: 0

🎉 ¡Excelente trabajo! Todos los issues pasaron QA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Acción:** Enviar email con celebración

### 3. Todos los Issues Fallaron

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ ALL ISSUES FAILED QA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proyecto #7
✅ Verificados: 15/15
✅ Movidos a Reviewed: 0
❌ Con problemas: 15

⚠️  Se requiere revisión urgente
Ningún issue pasó las verificaciones de QA

Problemas encontrados:
- 8 issues con errores TypeScript
- 5 issues con errores de consola
- 2 issues con archivos faltantes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Acción:** Enviar email URGENTE marcado como prioridad alta

### 4. Issue Backend (sin verificación browser)

Si un issue es puramente backend:
```
Issue #XX - Backend Change
- ✅ Archivos verificados
- ✅ Migraciones aplicadas
- ⊘  Browser: N/A (backend only)
- 🟢 MOVED TO REVIEWED
```

### 5. Error al Mover Issue

```bash
# Si falla la mutación GraphQL
{
  "errors": [
    {
      "message": "Field value not found",
      "path": ["updateProjectV2ItemFieldValue"]
    }
  ]
}
```

**Acción:**
- ❌ No marcar como Reviewed
- 📝 Registrar en reporte
- ⚠️  Incluir en email con advertencia

## Optimizaciones

### Ejecución en Paralelo

Para proyectos grandes (>10 issues), verificar múltiples issues en paralelo:

```bash
# Dividir issues en lotes de 3
issues=(210 211 212 213 214 ...)

for i in $(seq 0 3 ${#issues[@]}); do
  # Procesar 3 issues simultáneamente
  verify_issue ${issues[$i]} &
  verify_issue ${issues[$i+1]} &
  verify_issue ${issues[$i+2]} &
  wait
done
```

### Cache de Compilación

```bash
# Primera compilación: completa
npx tsc --noEmit

# Siguientes: incremental (más rápido)
npx tsc --noEmit --incremental
```

### Reutilizar Sesión Browser

```javascript
// Abrir browser una vez
await browser_navigate({ url: "http://localhost:3000" })

// Para cada issue, solo navegar dentro
for (issue of issues) {
  await browser_click({ element: issue.page_tab })
  await browser_console_messages({ level: "error" })
}

// Cerrar al final
await browser_close()
```

## Integración con Workflow

Este skill se ejecuta de forma **independiente** o como parte de un workflow:

```
DESARROLLO
  ↓
PASO 1: Issues marcados como "Done"
  ↓
PASO 2: 🔍 /qa:review-done <proyecto> ← ESTE SKILL
  ↓
  ¿Todos aprobados?
  ├─ ✅ SÍ → Email celebración, issues en "Reviewed"
  └─ ❌ NO → Email con errores, issues en "Done"
  ↓
PASO 3: Correcciones (si necesario)
  ↓
PASO 4: Re-ejecutar /qa:review-done
```

## Configuración de Email

Para configurar el envío de emails, crear archivo `.claude/skills/qa-review-done/email-config.json`:

```json
{
  "enabled": true,
  "service": "sendgrid",
  "api_key_env": "SENDGRID_API_KEY",
  "from": "qa-bot@gextiona.com",
  "to": "{{userEmail}}",
  "subject_prefix": "[QA Review]",
  "include_screenshots": true,
  "priority": "normal"
}
```

O usar variables de entorno:
```bash
export QA_EMAIL_TO="{{userEmail}}"
export QA_EMAIL_FROM="qa-bot@gextiona.com"
export SENDGRID_API_KEY="SG.xxx..."
```

## Output JSON (para automatización)

```json
{
  "qa_review_result": {
    "project_number": 7,
    "project_title": "Revisión de Calidad - Frontend",
    "timestamp": "2025-12-20T15:30:00Z",
    "duration_seconds": 480,
    "summary": {
      "total_issues": 15,
      "verified": 15,
      "approved": 12,
      "failed": 3
    },
    "approved_issues": [
      {"number": 210, "title": "..."},
      {"number": 211, "title": "..."}
    ],
    "failed_issues": [
      {
        "number": 216,
        "title": "...",
        "reason": "TypeScript errors",
        "errors": ["Property 'nombre' does not exist"]
      }
    ],
    "email_sent": true,
    "email_to": "{{userEmail}}"
  }
}
```

## Notas Importantes

- **SIEMPRE** verificar TypeScript compilation (frontend critical)
- **SIEMPRE** capturar errores de consola browser
- **SIEMPRE** tomar screenshots como evidencia
- **SIEMPRE** enviar email al completar (aunque no haya issues)
- **NUNCA** mover a Reviewed si hay errores
- **NUNCA** skip verificaciones para acelerar
- Si timeout (>15 min), reportar y enviar email con estado parcial
- Screenshots se guardan en `.claude/qa-reports/<fecha>/screenshots/`
- Reportes completos en `.claude/qa-reports/<fecha>/report.md`

## Ejemplo de Ejecución Completa

```bash
$ /qa:review-done 7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 QA REVIEW - PROYECTO #7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Obteniendo issues en Done...
✅ Encontrados: 15 issues

Verificando issue #210...
  ✅ Archivos: 3/3
  ✅ TypeScript: Sin errores
  ✅ Browser: 0 errores
  🟢 MOVED TO REVIEWED

Verificando issue #211...
  ✅ Archivos: 5/5
  ✅ TypeScript: Sin errores
  ✅ Browser: 0 errores
  🟢 MOVED TO REVIEWED

Verificando issue #216...
  ✅ Archivos: 2/2
  ❌ TypeScript: 2 errores
  🔴 KEPT IN DONE

... (continúa)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RESUMEN FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Verificados: 15/15
✅ Aprobados: 12
❌ Con problemas: 3
⏱️  Tiempo: 8 min 23 seg

📧 Enviando email a {{userEmail}}...
✅ Email enviado correctamente

📄 Reporte guardado en:
   .claude/qa-reports/2025-12-20_1530/report.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
