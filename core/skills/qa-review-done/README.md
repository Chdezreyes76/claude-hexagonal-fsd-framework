# QA Review Done - Automated Issue Verification

Skill automatizado para revisar todos los issues en columna "Done" de un proyecto GitHub y moverlos a "Reviewed" si pasan las validaciones de QA.

## Uso

```bash
/qa:review-done <numero-proyecto>
```

### Ejemplos

```bash
# Revisar proyecto #7 (Revisión de Calidad - Frontend)
/qa:review-done 7

# Revisar proyecto #8 (Refactor FSD)
/qa:review-done 8
```

## ¿Qué Hace?

1. **Obtiene issues en "Done"** del proyecto especificado
2. **Para cada issue:**
   - Lee descripción y criterios de aceptación
   - Verifica archivos mencionados existen
   - Ejecuta compilación TypeScript
   - Abre navegador y verifica páginas relevantes
   - Captura errores de consola
   - Toma screenshots como evidencia
3. **Mueve issues aprobados** a columna "Reviewed"
4. **Genera reporte detallado** con estadísticas
5. **Envía email** a {{userEmail}} con resumen

## Criterios de Aprobación

Un issue se mueve a "Reviewed" si:
- ✅ Todos los archivos mencionados existen
- ✅ TypeScript compila sin errores (frontend)
- ✅ No hay errores en consola del browser
- ✅ La funcionalidad se puede verificar visualmente

Un issue se mantiene en "Done" si:
- ❌ Faltan archivos mencionados
- ❌ Errores de compilación TypeScript
- ❌ Errores en consola del browser
- ❌ La funcionalidad no se puede verificar

## Configuración de Email

### Opción 1: Variables de Entorno

```bash
# Configurar destinatario
export QA_EMAIL_TO="{{userEmail}}"
export QA_EMAIL_FROM="qa-bot@gextiona.com"

# Si usas SendGrid
export SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"

# Si usas Mailgun
export MAILGUN_API_KEY="key-xxxxxxxxxxxxx"
export MAILGUN_DOMAIN="mg.gextiona.com"
```

### Opción 2: Archivo de Configuración

Crear `.claude/skills/qa-review-done/email-config.json`:

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

### Opción 3: Usar PowerShell (Windows)

Si estás en Windows y tienes configurado Outlook o SMTP:

```powershell
# El script intentará usar PowerShell automáticamente
# Te pedirá credenciales la primera vez
```

### Opción 4: Fallback - Guardar en Log

Si ningún servicio de email está configurado, el resumen se guarda en:
```
.claude/qa-reports/email-YYYYMMDD_HHMMSS.html
```

## Estructura de Reportes

Los reportes se guardan en:
```
.claude/qa-reports/
├── YYYY-MM-DD_HHMM/
│   ├── report.md              # Reporte completo
│   ├── screenshots/           # Screenshots de cada issue
│   │   ├── issue-210-1.png
│   │   ├── issue-210-2.png
│   │   └── ...
│   └── summary.json           # Datos en JSON
└── email-YYYYMMDD_HHMMSS.html # Emails guardados (si no se envían)
```

## Formato del Email

El email incluye:

### Asunto
```
[QA Review] Proyecto #7 - 12/15 Aprobados
```

### Contenido HTML
- **Resumen ejecutivo** con estadísticas
- **Lista de issues aprobados** (✅ movidos a Reviewed)
- **Lista de issues con problemas** (❌ mantenidos en Done)
- **Tabla de errores** detallando cada problema
- **Próximos pasos** recomendados
- **Capturas de pantalla** (opcional)

## Ejemplo de Salida

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

## Casos de Uso

### 1. Revisión Periódica

```bash
# Cada viernes, revisar issues completados
/qa:review-done 7
```

### 2. Pre-Release

```bash
# Antes de release, verificar todo está OK
/qa:review-done 7
/qa:review-done 8
```

### 3. Después de Sprint

```bash
# Al final del sprint, validar trabajo completado
/qa:review-done 7
```

## Integración con Workflow

```mermaid
graph LR
    A[Desarrollo] --> B[Issues en Done]
    B --> C[/qa:review-done]
    C --> D{¿Aprobados?}
    D -->|Sí| E[Moved to Reviewed]
    D -->|No| F[Kept in Done]
    F --> G[Corregir Issues]
    G --> C
    E --> H[Email Enviado]
```

## Troubleshooting

### Email no se envía

1. Verificar variables de entorno:
   ```bash
   echo $QA_EMAIL_TO
   echo $SENDGRID_API_KEY
   ```

2. Verificar log file:
   ```bash
   cat .claude/qa-reports/email-*.html
   ```

3. Configurar servicio manualmente:
   ```bash
   export SENDGRID_API_KEY="tu-key-aqui"
   ```

### TypeScript no compila

1. Verificar que frontend esté instalado:
   ```bash
   cd frontend && npm install
   ```

2. Limpiar cache:
   ```bash
   cd frontend && npm run clean
   ```

### Browser no responde

1. Verificar que app esté corriendo:
   ```bash
   # Terminal 1
   cd backend && uvicorn main:app --reload

   # Terminal 2
   cd frontend && npm run dev
   ```

2. Verificar Playwright instalado:
   ```bash
   claude mcp list
   ```

## Optimizaciones

### Ejecutar en Paralelo (Proyectos Grandes)

Para proyectos con >20 issues, el skill automáticamente:
- Divide issues en lotes de 5
- Procesa lotes en paralelo
- Reduce tiempo de ~15 min a ~5 min

### Cache de TypeScript

- Primera compilación: completa (~30 seg)
- Siguientes: incremental (~5 seg)

### Reutilizar Sesión Browser

- Abre browser una vez
- Navega entre páginas rápidamente
- Cierra al finalizar

## Métricas

El skill reporta:
- ✅ Issues verificados
- ✅ Issues aprobados y movidos a Reviewed
- ❌ Issues con problemas y mantenidos en Done
- ⏱️  Tiempo total de ejecución
- 📸 Screenshots capturados
- 📧 Email enviado (sí/no)

## Contribuir

Para mejorar este skill:

1. Editar `.claude/skills/qa-review-done/SKILL.md`
2. Probar con: `/qa:review-done <proyecto>`
3. Documentar cambios en este README

## Soporte

Si encuentras problemas:
1. Revisar logs en `.claude/qa-reports/`
2. Ejecutar con verbose: `/qa:review-done 7 --verbose`
3. Reportar en GitHub Issues del proyecto
