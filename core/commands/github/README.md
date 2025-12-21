# GitHub Commands

Comandos disponibles para gestionar el flujo de trabajo de GitHub.

## Comandos Disponibles

### `/priorities` - Analizar Prioridades de Issues

Analiza todos los issues abiertos del repositorio y devuelve los 3 más urgentes según su prioridad.

**Uso básico:**
```bash
# Analizar todos los issues del repositorio actual
/priorities

# Analizar issues de un proyecto específico de GitHub
/priorities 5
```

**Criterios de priorización:**
1. 🔴 `priority: critical` - Bloquea producción (máxima urgencia)
2. 🟠 `priority: high` - Resolver pronto
3. 🟡 `priority: medium` - Planificar en sprint
4. 🟢 `priority: low` - Cuando haya tiempo
5. ⚪ Sin label de prioridad - Considerado como low

**Criterios de desempate** (cuando varios issues tienen la misma prioridad):
- Issues asignados al usuario actual tienen preferencia
- Issues con estado `status: ready` tienen preferencia
- Issues más antiguos tienen preferencia
- Issues con `status: blocked` van al final

**Salida:**
- Tabla con los 3 issues más urgentes
- Información detallada de cada issue (prioridad, tipo, estado, asignación, área)
- Estadísticas generales del proyecto (distribución por prioridad)
- Sugerencias de siguiente paso

---

### `/start` - Iniciar Trabajo en Issue

Inicia el trabajo en un issue creando una branch y asignándolo.

**Uso:**
```bash
/start 42
```

---

### `/issue` - Crear Issue

Crea un nuevo issue en GitHub con el template apropiado.

**Uso:**
```bash
/issue feature Añadir filtro por fecha en nominas
/issue bug Error al cargar usuarios sin rol asignado
```

---

### `/pr` - Crear Pull Request

Crea un Pull Request vinculado al issue actual.

**Uso:**
```bash
/pr
```

---

### `/merge` - Mergear PR

Mergea un PR, hace pull y limpia ramas locales/remotas.

**Uso:**
```bash
/merge
```

## Ejemplos Completos

### Workflow típico con prioridades:

```bash
# 1. Ver cuáles son los issues más urgentes
/priorities

# Salida ejemplo:
# Top 3 Issues Más Urgentes
#
# 1. #184 - OverrideButton sin memoización causa N+1 queries
#    - Prioridad: medium
#    - Tipo: bug
#    - Estado: ready
#    ...
#
# 2. #183 - Código duplicado en SelectValue
#    - Prioridad: medium
#    ...

# 2. Iniciar trabajo en el más urgente
/start 184

# 3. [Hacer cambios en el código]

# 4. Crear PR
/pr

# 5. Mergear cuando esté aprobado
/merge

# 6. Revisar las nuevas prioridades
/priorities
```

## Notas

- Todos los comandos usan el GitHub CLI (`gh`) internamente
- Requieren autenticación con GitHub (`gh auth login`)
- Los comandos respetan las convenciones del proyecto definidas en `.claude/skills/github-workflow/SKILL.md`
