# Instrucciones para Completar la Extracción del Framework

## Estado Actual

Has comenzado la extracción del framework `.claude` de Gextiona Dashboard. Los siguientes archivos ya están creados:

✅ **Completado**:
- `README.md` - Documentación principal del framework
- `SETUP.ps1` - Script para copiar estructura desde Gextiona
- `PARAMETRIZE.ps1` - Script para reemplazar referencias hard-coded
- `cli/package.json` - Configuración del CLI
- `core/agents/issue-planner.md` - Agente de planificación (parametrizado)
- `core/agents/code-reviewer.md.tmpl` - Agente de revisión (template)

## Próximos Pasos para Completar

### Paso 1: Ejecutar Script de Copia (5 minutos)

```powershell
cd C:\Users\Carlos.Hernandez\Proyectos\claude-hexagonal-fsd-framework
.\SETUP.ps1
```

Este script copiará automáticamente:
- ✅ Todos los agentes (3)
- ✅ Todos los comandos (20+)
- ✅ Todos los skills (11)
- ✅ Todos los templates (18+)
- ✅ Hooks
- ✅ Settings

### Paso 2: Ejecutar Script de Parametrización (5 minutos)

```powershell
.\PARAMETRIZE.ps1
```

Este script reemplazará automáticamente:
- "Gextiona" → "{{projectName}}"
- "carlos@laorotava.org" → "{{userEmail}}"
- "Chdezreyes76" → "{{githubOwner}}"
- Y 10+ reemplazos más

### Paso 3: Crear Archivos Restantes Manualmente (10 minutos)

Crear estos archivos copiando el contenido indicado:

#### 3.1 `.gitignore`
Copiar el .gitignore estándar de Node.js + Python

#### 3.2 `LICENSE`
MIT License ya proporcionado en este documento

#### 3.3 `CHANGELOG.md`
Archivo de changelog inicial ya proporcionado

#### 3.4 `config/schema.json`
JSON Schema completo para validación (ya proporcionado en plan)

#### 3.5 `config/defaults.json`
```json
{
  "version": "1.0.0",
  "project": {
    "version": "1.0.0"
  },
  "stack": {
    "backend": {
      "language": "python",
      "version": "3.11",
      "framework": "fastapi",
      "architecture": "hexagonal",
      "dirName": "backend",
      "port": 8000
    },
    "frontend": {
      "language": "typescript",
      "framework": "react",
      "version": "19",
      "architecture": "feature-sliced-design",
      "dirName": "frontend",
      "port": 3000
    },
    "database": {
      "type": "mysql",
      "version": "8.0",
      "port": 3306,
      "migrations": "alembic"
    }
  },
  "qa": {
    "enabled": true,
    "emailReports": false,
    "localReportPath": "./.claude/qa-reports"
  },
  "workflows": {
    "autoImplement": true,
    "autoReview": true,
    "autoMerge": false,
    "requireTests": false
  }
}
```

### Paso 4: Implementar CLI Tool (2-3 horas)

Crear los siguientes archivos en `cli/lib/`:

#### 4.1 `cli/index.js`
Entry point del CLI que procesa argumentos

#### 4.2 `cli/lib/init.js`
Wizard interactivo con inquirer

#### 4.3 `cli/lib/config-generator.js`
Genera claude.config.json desde respuestas del wizard

#### 4.4 `cli/lib/template-processor.js`
Procesa templates {{variable}} con Mustache

#### 4.5 `cli/lib/validator.js`
Valida configuración contra JSON Schema

#### 4.6 `cli/lib/utils.js`
Funciones de utilidad (naming conversions, etc.)

**Referencia de código en el plan detallado**: Ver sección "Fase 3: Construir CLI Tool"

### Paso 5: Crear Documentación (1-2 horas)

#### 5.1 `docs/getting-started.md`
Guía de inicio rápido

#### 5.2 `docs/configuration.md`
Referencia completa de configuración

#### 5.3 `docs/cli-reference.md`
Documentación de comandos CLI

#### 5.4 `docs/migration-guide.md`
Guía para migrar proyectos existentes

#### 5.5 `docs/architecture/`
Copiar de Gextiona:
- `hexagonal-backend.md`
- `fsd-frontend.md`

### Paso 6: Crear Ejemplos (1 hora)

#### 6.1 `config/examples/minimal.json`
Configuración mínima

#### 6.2 `config/examples/saas-dashboard.json`
Dashboard completo (similar a Gextiona)

#### 6.3 `config/examples/ecommerce.json`
E-commerce con dominios custom

### Paso 7: Testing (2 horas)

#### 7.1 Crear Proyecto Dummy
```bash
mkdir C:\Users\Carlos.Hernandez\Proyectos\test-todo-app
cd test-todo-app
git init
```

#### 7.2 Inicializar Framework
```bash
cd C:\Users\Carlos.Hernandez\Proyectos\claude-hexagonal-fsd-framework\cli
npm install
node index.js init ..\test-todo-app
```

#### 7.3 Verificar
- ¿Se creó `.claude/` correctamente?
- ¿`claude.config.json` no tiene referencias a "Gextiona"?
- ¿Los settings están parametrizados?
- ¿Los comandos funcionan?

### Paso 8: Git & Release (30 minutos)

#### 8.1 Inicializar Git (si no está)
```bash
cd C:\Users\Carlos.Hernandez\Proyectos\claude-hexagonal-fsd-framework
git init
git add .
git commit -m "Initial framework extraction from Gextiona

- 11 skills (hexagonal, FSD, implementers, QA, workflows)
- 20+ commands (GitHub, scaffold, quality, db, workflow)
- 3 agents (planner, reviewer, debugger)
- 18+ code templates
- CLI tool with interactive wizard
- Complete documentation

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### 8.2 Crear Repositorio en GitHub
```bash
gh repo create claude-hexagonal-fsd-framework --public --source=. --remote=origin
git push -u origin main
```

#### 8.3 Crear Release
```bash
git tag v1.0.0
git push --tags
gh release create v1.0.0 --title "v1.0.0 - Initial Release" --notes "First stable release of Claude Hexagonal+FSD Framework"
```

## Checklist Final

- [ ] SETUP.ps1 ejecutado correctamente
- [ ] PARAMETRIZE.ps1 ejecutado correctamente
- [ ] No quedan referencias "Gextiona", "carlos@laorotava", "Chdezreyes76"
- [ ] Archivos .gitignore, LICENSE, CHANGELOG creados
- [ ] config/schema.json y defaults.json creados
- [ ] CLI tool implementado y funcional
- [ ] npm install funciona en cli/
- [ ] Documentación completa en docs/
- [ ] Ejemplos de configuración creados
- [ ] Proyecto dummy testeado exitosamente
- [ ] Repositorio Git creado y pusheado
- [ ] Release v1.0.0 publicado

## Tiempos Estimados

| Tarea | Tiempo |
|-------|--------|
| Scripts (Paso 1-2) | 10 min |
| Archivos manuales (Paso 3) | 10 min |
| CLI Tool (Paso 4) | 2-3 horas |
| Documentación (Paso 5) | 1-2 horas |
| Ejemplos (Paso 6) | 1 hora |
| Testing (Paso 7) | 2 horas |
| Git & Release (Paso 8) | 30 min |
| **TOTAL** | **7-9 horas** |

## Recursos

- **Plan completo**: `C:\Users\Carlos.Hernandez\.claude\plans\sleepy-roaming-avalanche.md`
- **Proyecto origen**: `C:\Users\Carlos.Hernandez\Proyectos\GextionaDashboard\.claude`
- **Framework destino**: `C:\Users\Carlos.Hernandez\Proyectos\claude-hexagonal-fsd-framework`

## Ayuda

Si encuentras problemas:

1. **Referencias hardcoded no reemplazadas**: Ejecutar `git grep "Gextiona"` y reemplazar manualmente
2. **CLI no funciona**: Verificar `npm install` en `cli/` y dependencias en package.json
3. **Templates no procesan**: Verificar sintaxis Mustache `{{variable}}`
4. **Tests fallan**: Verificar que proyecto dummy tenga estructura backend/ y frontend/

---

**¡Éxito con el framework!** 🚀
