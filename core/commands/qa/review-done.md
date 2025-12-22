---
description: Revisar automaticamente todos los issues en Done de un proyecto y moverlos a Reviewed si pasan QA
allowed-tools: Task, Read, Glob, Grep, Bash(gh:*), MCPSearch, mcp__playwright__browser_navigate, mcp__playwright__browser_click, mcp__playwright__browser_snapshot, mcp__playwright__browser_console_messages, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_network_requests
---

# QA Review Done - Automated Issue Verification

El usuario quiere revisar automaticamente todos los issues en columna "Done" de un proyecto GitHub. Argumentos: $ARGUMENTS

## Instrucciones

1. **Parsear argumentos** ($ARGUMENTS):

   Soporta DOS formatos:

   **Formato A: Posicional** (legacy, mantener compatibilidad)
   ```bash
   /qa:review-done 12
   /qa:review-done 7 --skip-browser
   ```

   **Formato B: Named Parameters** (recomendado, más explícito)
   ```bash
   /qa:review-done --project=12
   /qa:review-done --project=7 --skip-browser
   /qa:review-done --project=12 --dry-run --skip-email
   ```

   **Parseo de $ARGUMENTS:**
   ```javascript
   // Extraer numero de proyecto
   let projectNumber = null;

   // Buscar --project=X
   const projectMatch = $ARGUMENTS.match(/--project=(\d+)/);
   if (projectMatch) {
     projectNumber = projectMatch[1];
   }

   // Si no, buscar primer numero (formato posicional)
   if (!projectNumber) {
     const numberMatch = $ARGUMENTS.match(/^\s*(\d+)/);
     if (numberMatch) {
       projectNumber = numberMatch[1];
     }
   }

   // Extraer flags opcionales
   const skipBrowser = $ARGUMENTS.includes('--skip-browser');
   const skipEmail = $ARGUMENTS.includes('--skip-email');
   const dryRun = $ARGUMENTS.includes('--dry-run');
   ```

2. **Validar proyecto**:
   - REQUERIDO: Numero de proyecto (ej: `7`, `12`, `15`)
   - Si no se proporciona: Preguntar al usuario el numero de proyecto
   - Si el usuario no sabe: Listar proyectos disponibles con `gh project list`

3. **Invocar skill qa-review-done**:
   ```
   Usar Skill tool con:
     skill="qa-review-done"
     args="<numero-proyecto>"
   ```

   Pasar flags opcionales al skill según estén en $ARGUMENTS:
   - `--skip-browser` → Omitir verificación browser
   - `--skip-email` → No enviar email
   - `--dry-run` → Simular sin mover issues

   El skill ejecutara:
   - Obtener todos los issues en columna "Done"
   - Verificar cada issue (archivos, TypeScript, browser errors, network requests)
   - Analizar POST/PUT/DELETE requests y validar responses
   - Mover issues aprobados a "Reviewed"
   - Generar reporte detallado
   - Enviar email con resumen

4. **Mostrar progreso en tiempo real**:
   - Total de issues encontrados
   - Progreso de verificacion (X/Y issues)
   - Resultado por issue (✅ aprobado / ❌ con problemas)

4. **Mostrar resumen final**:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ RESUMEN QA REVIEW
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ✅ Verificados: 15/15
   ✅ Aprobados: 12
   ❌ Con problemas: 3
   ⏱️  Tiempo: 8 min 23 seg

   📧 Email enviado a {{userEmail}}
   📄 Reporte guardado en: .claude/qa-reports/2025-12-22_1530/report.md

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

## Argumentos

| Argumento | Descripción | Ejemplo |
|-----------|-------------|---------|
| `<numero>` o `--project=<numero>` | Numero del proyecto GitHub (REQUERIDO) | `12`, `--project=7` |
| `--skip-browser` | Omitir verificación en navegador | `/qa:review-done --project=7 --skip-browser` |
| `--skip-email` | No enviar email al finalizar | `/qa:review-done --project=7 --skip-email` |
| `--dry-run` | Simular sin mover issues | `/qa:review-done --project=7 --dry-run` |

## Sintaxis

**Named Parameters (Recomendado):**
```bash
/qa:review-done --project=<numero> [opciones]
```

**Posicional (Legacy, mantiene compatibilidad):**
```bash
/qa:review-done <numero> [opciones]
```

## Ejemplos de Uso

**Sintaxis Recomendada (Named Parameters):**
```bash
# Uso básico con sintaxis explícita
/qa:review-done --project=12

# Listar proyectos primero
gh project list
/qa:review-done --project=7

# Dry run (solo verificar, no mover)
/qa:review-done --project=12 --dry-run

# Sin verificación browser (más rápido)
/qa:review-done --project=7 --skip-browser

# Sin email (solo reporte local)
/qa:review-done --project=12 --skip-email

# Combinar múltiples opciones
/qa:review-done --project=7 --dry-run --skip-email

# Solo verificar archivos y TypeScript (más rápido)
/qa:review-done --project=12 --skip-browser --skip-email
```

**Sintaxis Legacy (mantiene compatibilidad):**
```bash
# Formato posicional simple
/qa:review-done 7

# Con opciones
/qa:review-done 12 --dry-run
/qa:review-done 7 --skip-browser
```

## Verificaciones Ejecutadas

Para cada issue en "Done", el skill verifica:

### ✅ Verificacion de Archivos
- Archivos mencionados en el issue existen
- No hay imports rotos
- Estructura correcta segun FSD (frontend) o Hexagonal (backend)

### ✅ Compilacion TypeScript (Frontend)
```bash
cd frontend
npx tsc --noEmit
```
- PASS: Sin errores de compilacion
- FAIL: Errores de tipos → Mantener en Done

### ✅ Verificacion en Navegador (Frontend)
```javascript
// Abrir navegador en localhost:3000
// Navegar a paginas relevantes segun issue
// Capturar errores de consola
// Tomar screenshots como evidencia
```
- PASS: 0 errores de consola
- FAIL: Errores en consola → Mantener en Done

### ✅ **Análisis de Network Requests (NUEVO - API Validation)**
```javascript
// Capturar todas las network requests durante navegación
const requests = await browser_network_requests()

// Analizar POST/PUT/DELETE requests
for (const req of requests.filter(r => ['POST','PUT','DELETE'].includes(r.method))) {
  // Validar status code (2xx = success)
  // Validar response body (JSON válido, sin errores)
  // Verificar tiempos de respuesta (<5s)
  // Detectar CORS, auth errors, backend down
}
```

**Criterios:**
- ✅ PASS: Todos los POST/PUT/DELETE con status 2xx, JSON válido, <5s
- ⚠️ WARNING: Requests lentos (>3s) pero exitosos
- ❌ FAIL: Status 4xx/5xx, CORS errors, backend no responde

**Ejemplos de Validación:**
```javascript
// ✅ POST /api/v1/usuarios
Request: {"nombre": "Juan", "email": "juan@test.com", "rol": "ADMIN"}
Response: 201 Created, {"id": 123, "nombre": "Juan", ...}

// ❌ POST /api/v1/productos
Request: {"nombre": "Producto 1"}
Response: 500 Internal Server Error, {"detail": "Database timeout"}
→ FAIL: Issue permanece en Done
```

**Errores Detectados Automáticamente:**
- Backend no está corriendo (ECONNREFUSED)
- CORS policy bloqueando requests
- 401 Unauthorized (auth requerida)
- 422 Validation errors (campos inválidos)
- 500 Internal Server Error (bugs en backend)
- Timeouts (>10s sin respuesta)

### ✅ Migraciones (Backend con cambios DB)
- Verificar migraciones Alembic aplicadas
- Sin conflictos de migracion

## Criterios de Aprobacion

Un issue pasa a "Reviewed" si cumple **TODOS** estos criterios:

| Criterio | Descripcion | Impacto |
|----------|-------------|---------|
| ✅ Archivos existen | Todos los archivos mencionados están presentes | CRITICAL |
| ✅ TypeScript compila | Sin errores de tipos (frontend) | CRITICAL |
| ✅ Sin errores browser | 0 errores en consola JavaScript | CRITICAL |
| ✅ **Network requests OK** | **POST/PUT/DELETE con status 2xx, JSON válido** | **CRITICAL** |
| ✅ **API responses válidas** | **No errors en response bodies** | **CRITICAL** |
| ⚠️ Performance OK | Requests <5s (warnings si >3s pero no falla) | WARNING |
| ✅ Migraciones OK | Migraciones aplicadas sin conflictos (si aplica) | CRITICAL |

Si **CUALQUIER** criterio CRITICAL falla, el issue permanece en "Done".

### Ejemplos de Fallo por Network Requests:

**Caso 1: Backend Error 500**
```
Issue #210 - POST /api/v1/usuarios
Response: 500 Internal Server Error
❌ FAIL → Permanece en Done
Razón: "API error: 500 Internal Server Error - Database connection timeout"
```

**Caso 2: CORS Error**
```
Issue #211 - POST /api/v1/productos
Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
❌ FAIL → Permanece en Done
Razón: "CORS policy blocking requests"
```

**Caso 3: Validation Error 422**
```
Issue #212 - POST /api/v1/centros-coste
Response: 422 Unprocessable Entity
Body: {"detail": [{"loc": ["body", "codigo"], "msg": "field required"}]}
❌ FAIL → Permanece en Done
Razón: "Request validation errors - missing required field 'codigo'"
```

## Integracion con Workflow

Este comando se ejecuta tipicamente:

```
DESARROLLO
  ↓
Issues marcados como "Done" manualmente
  ↓
🔍 /qa/review-done <proyecto>  ← ESTE COMANDO
  ↓
  ¿Todos aprobados?
  ├─ ✅ SI → Email celebracion, issues en "Reviewed"
  └─ ❌ NO → Email con errores, issues en "Done"
  ↓
Correcciones (si necesario)
  ↓
Re-ejecutar /qa/review-done
```

## Reporte Generado

El skill genera un reporte Markdown en `.claude/qa-reports/<fecha>/report.md` con:

- Resumen ejecutivo (aprobados, fallidos, tiempo)
- Lista de issues aprobados con detalles
- Lista de issues con problemas y razon
- Estadisticas detalladas por categoria
- Screenshots capturados (evidencia visual)
- Proximos pasos recomendados

## Email de Resumen

Si esta habilitado (default), envia email HTML a `{{userEmail}}` con:

- Resumen ejecutivo visual (colores verde/rojo)
- Tabla de issues aprobados
- Tabla de issues con problemas y accion requerida
- Proximos pasos recomendados
- Enlace al reporte completo

Configurar en `.claude/skills/qa-review-done/email-config.json` (ver skill README).

## Casos Especiales

### Sin Issues en Done
```
ℹ️  NO ISSUES TO REVIEW
Proyecto #7: Revision de Calidad
Issues en "Done": 0

✅ Todos los issues ya han sido revisados
```
No envia email.

### Todos Aprobados
```
✅ ALL ISSUES APPROVED
15/15 issues pasaron QA

🎉 Excelente trabajo!
```
Envia email de celebracion.

### Todos Fallaron
```
❌ ALL ISSUES FAILED QA
0/15 issues pasaron QA

⚠️  Se requiere revision urgente
```
Envia email URGENTE con prioridad alta.

## Optimizaciones

- **Compilacion incremental**: TypeScript usa cache entre issues
- **Sesion browser reutilizada**: Un solo navegador para todos los issues
- **Verificacion paralela**: Hasta 3 issues en paralelo (si >10 issues)

## Notas Importantes

- **SIEMPRE** verifica TypeScript compilation (frontend critical)
- **SIEMPRE** captura errores de consola browser
- **SIEMPRE** toma screenshots como evidencia
- **SIEMPRE** envia email al completar (aunque no haya issues)
- **NUNCA** mueve a Reviewed si hay errores
- **NUNCA** omite verificaciones para acelerar
- Si timeout (>15 min), reporta y envia email con estado parcial

## Troubleshooting

### Error: "Project not found"
```bash
# Verificar numero de proyecto correcto
gh project list

# Formato: /qa/review-done <numero>
/qa/review-done 7
```

### Error: "Frontend server not running"
```bash
# Iniciar servidor desarrollo
cd frontend
npm run dev

# Esperar a que este listo
# Luego ejecutar: /qa/review-done 7
```

### Email no se envia
```bash
# Verificar configuracion email
cat .claude/skills/qa-review-done/email-config.json

# O usar --skip-email para generar solo reporte local
/qa/review-done 7 --skip-email
```

## Ver Tambien

- `/quality/review` - Revisar cambios de codigo antes de commit
- Skill `qa-review-done` - Documentacion completa del skill
- `.claude/skills/qa-review-done/README.md` - Configuracion detallada
