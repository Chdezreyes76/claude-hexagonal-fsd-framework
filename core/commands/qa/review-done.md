---
description: Revisar automaticamente todos los issues en Done de un proyecto y moverlos a Reviewed si pasan QA
allowed-tools: Task, Read, Glob, Grep, Bash(gh:*), MCPSearch, mcp__playwright__browser_navigate, mcp__playwright__browser_click, mcp__playwright__browser_snapshot, mcp__playwright__browser_console_messages, mcp__playwright__browser_take_screenshot
---

# QA Review Done - Automated Issue Verification

El usuario quiere revisar automaticamente todos los issues en columna "Done" de un proyecto GitHub. Argumentos: $ARGUMENTS

## Instrucciones

1. **Validar argumentos**:
   - REQUERIDO: Numero de proyecto (ej: `7`, `15`)
   - Si no se proporciona: Preguntar al usuario el numero de proyecto
   - Si el usuario no sabe: Listar proyectos disponibles con `gh project list`

2. **Invocar skill qa-review-done**:
   ```
   Usar Skill tool con skill="qa-review-done" y args="<numero-proyecto>"
   ```

   El skill ejecutara:
   - Obtener todos los issues en columna "Done"
   - Verificar cada issue (archivos, TypeScript, browser errors)
   - Mover issues aprobados a "Reviewed"
   - Generar reporte detallado
   - Enviar email con resumen

3. **Mostrar progreso en tiempo real**:
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

| Argumento | Descripcion | Ejemplo |
|-----------|-------------|---------|
| `<numero>` | Numero del proyecto GitHub (REQUERIDO) | `7`, `15`, `23` |
| `--skip-browser` | Omitir verificacion en navegador | `/qa/review-done 7 --skip-browser` |
| `--skip-email` | No enviar email al finalizar | `/qa/review-done 7 --skip-email` |
| `--dry-run` | Simular sin mover issues | `/qa/review-done 7 --dry-run` |

## Ejemplo de Uso

```bash
# Uso basico (recomendado)
/qa/review-done 7

# Listar proyectos primero
gh project list
/qa/review-done 15

# Dry run (solo verificar, no mover)
/qa/review-done 7 --dry-run

# Sin verificacion browser (mas rapido)
/qa/review-done 7 --skip-browser

# Sin email (solo reporte local)
/qa/review-done 7 --skip-email
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

### ✅ Migraciones (Backend con cambios DB)
- Verificar migraciones Alembic aplicadas
- Sin conflictos de migracion

## Criterios de Aprobacion

Un issue pasa a "Reviewed" si cumple **TODOS** estos criterios:

| Criterio | Descripcion |
|----------|-------------|
| ✅ Archivos existen | Todos los archivos mencionados estan presentes |
| ✅ TypeScript compila | Sin errores de tipos (frontend) |
| ✅ Sin errores browser | 0 errores en consola JavaScript |
| ✅ Migraciones OK | Migraciones aplicadas sin conflictos (si aplica) |

Si **CUALQUIER** criterio falla, el issue permanece en "Done".

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
