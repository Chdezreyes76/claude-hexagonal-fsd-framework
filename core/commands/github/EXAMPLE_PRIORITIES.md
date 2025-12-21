# Ejemplo de Uso: /priorities

## Caso 1: Analizar todos los issues del repositorio

**Comando:**
```bash
/priorities
```

**Salida esperada:**
```markdown
## Top 3 Issues Más Urgentes

### 1. #184 - [MEDIA] pages/MovimientosPage - OverrideButton sin memoización causa N+1 queries
- **Prioridad**: 🟡 medium
- **Tipo**: bug
- **Estado**: Sin estado específico
- **Asignado a**: Sin asignar
- **Área**: frontend
- **Creado**: hace 1 día
- **Descripción**: El componente OverrideButton causa múltiples queries innecesarias por falta de memoización
- **URL**: https://github.com/{{githubOwner}}/GextionaDashboard/issues/184
- **Sugerencia**: `/start 184` para comenzar a trabajar

### 2. #183 - [MEDIA] pages/ConsultarMovimientosTab - Código duplicado en SelectValue
- **Prioridad**: 🟡 medium
- **Tipo**: refactor
- **Estado**: Sin estado específico
- **Asignado a**: Sin asignar
- **Área**: frontend
- **Creado**: hace 1 día
- **Descripción**: Hay código duplicado en el componente SelectValue que debería refactorizarse
- **URL**: https://github.com/{{githubOwner}}/GextionaDashboard/issues/183
- **Sugerencia**: `/start 183` para comenzar a trabajar

### 3. #182 - [MEDIA] pages/ImportarGastosTab - Código duplicado en SelectValue
- **Prioridad**: 🟡 medium
- **Tipo**: refactor
- **Estado**: Sin estado específico
- **Asignado a**: Sin asignar
- **Área**: frontend
- **Creado**: hace 1 día
- **Descripción**: Similar al #183, código duplicado que requiere refactorización
- **URL**: https://github.com/{{githubOwner}}/GextionaDashboard/issues/182
- **Sugerencia**: `/start 182` para comenzar a trabajar

---

## Estadísticas Generales

- **Total de issues abiertos**: 10
- **Distribución por prioridad**:
  - 🔴 Critical: 0
  - 🟠 High: 0
  - 🟡 Medium: 6 (60%)
  - 🟢 Low: 4 (40%)
  - ⚪ Sin prioridad: 0

---

## Sugerencias

✅ Hay 3 issues de prioridad media listos para trabajar
⚠️ Todos los issues están sin asignar - considera usar `/start <issue#>` para comenzar
```

## Caso 2: Analizar issues de un proyecto específico

**Comando:**
```bash
/priorities 5
```

**Salida esperada:**
Similar a Caso 1, pero filtrando solo los issues que pertenecen al proyecto GitHub #5.

## Caso 3: Repositorio con issues críticos

**Escenario:** Hay issues con `priority: critical` y `priority: high`

**Comando:**
```bash
/priorities
```

**Salida esperada:**
```markdown
## Top 3 Issues Más Urgentes

⚠️ ¡ATENCIÓN! Hay 2 issues críticos que requieren atención inmediata

### 1. #42 - [CRÍTICO] API de autenticación caída en producción
- **Prioridad**: 🔴 critical
- **Tipo**: bug
- **Estado**: ready
- **Asignado a**: @carlos
- **Área**: backend
- **Creado**: hace 2 horas
- **Descripción**: Los usuarios no pueden iniciar sesión, afecta toda la plataforma
- **URL**: https://github.com/.../issues/42
- **Sugerencia**: ⚠️ URGENTE - Resolver inmediatamente

### 2. #38 - [CRÍTICO] Base de datos llena, sistema bloqueado
- **Prioridad**: 🔴 critical
- **Tipo**: bug
- **Estado**: ready
- **Asignado a**: Sin asignar
- **Área**: database
- **Creado**: hace 1 día
- **Descripción**: El disco de la base de datos está al 98%, riesgo de caída total
- **URL**: https://github.com/.../issues/38
- **Sugerencia**: ⚠️ URGENTE - Asignar y resolver con prioridad máxima

### 3. #156 - [ALTA] Lentitud extrema en dashboard de nóminas
- **Prioridad**: 🟠 high
- **Tipo**: bug
- **Estado**: ready
- **Asignado a**: Sin asignar
- **Área**: frontend
- **Creado**: hace 3 días
- **Descripción**: El dashboard tarda más de 30 segundos en cargar
- **URL**: https://github.com/.../issues/156
- **Sugerencia**: `/start 156` para comenzar a trabajar

---

## Estadísticas Generales

- **Total de issues abiertos**: 25
- **Distribución por prioridad**:
  - 🔴 Critical: 2 (8%) ⚠️
  - 🟠 High: 5 (20%)
  - 🟡 Medium: 12 (48%)
  - 🟢 Low: 6 (24%)
  - ⚪ Sin prioridad: 0

---

## Sugerencias

⚠️ HAY 2 ISSUES CRÍTICOS - Requieren atención inmediata
🔥 5 issues de alta prioridad esperando
📋 Considera usar `/start <issue#>` para asignar y comenzar
```

## Caso 4: Issues con bloqueos

**Escenario:** Algunos issues tienen el label `status: blocked`

**Salida esperada:**
```markdown
## Top 3 Issues Más Urgentes

### 1. #210 - Implementar dashboard de costos
- **Prioridad**: 🟠 high
- **Tipo**: feature
- **Estado**: ready
- **Asignado a**: Sin asignar
- **Área**: frontend
- **Creado**: hace 5 días
- **Descripción**: Nueva funcionalidad para visualizar costos por departamento
- **URL**: https://github.com/.../issues/210
- **Sugerencia**: `/start 210` para comenzar a trabajar

### 2. #208 - Migrar a nueva versión de React
- **Prioridad**: 🟠 high
- **Tipo**: refactor
- **Estado**: ready
- **Asignado a**: @maria
- **Área**: frontend
- **Creado**: hace 1 semana
- **Descripción**: Actualizar de React 18 a React 19
- **URL**: https://github.com/.../issues/208
- **Nota**: Ya asignado a @maria

### 3. #195 - Optimizar queries de nóminas
- **Prioridad**: 🟡 medium
- **Tipo**: refactor
- **Estado**: ready
- **Asignado a**: Sin asignar
- **Área**: backend
- **Creado**: hace 2 semanas
- **Descripción**: Mejorar rendimiento de consultas SQL
- **URL**: https://github.com/.../issues/195
- **Sugerencia**: `/start 195` para comenzar a trabajar

---

## Issues Bloqueados (no incluidos en top 3)

⚠️ Los siguientes issues de alta/media prioridad están bloqueados:

- #206 - [ALTA] Integrar API de nóminas externa
  - **Bloqueado por**: Esperando credenciales del cliente
  - **Prioridad**: 🟠 high

- #198 - [MEDIA] Rediseño de UI según nuevas guías
  - **Bloqueado por**: Pendiente aprobación de diseños
  - **Prioridad**: 🟡 medium

---

## Estadísticas Generales

- **Total de issues abiertos**: 18
- **Issues bloqueados**: 2
- **Distribución por prioridad**:
  - 🔴 Critical: 0
  - 🟠 High: 3 (16%)
  - 🟡 Medium: 10 (55%)
  - 🟢 Low: 5 (27%)
  - ⚪ Sin prioridad: 0

---

## Sugerencias

✅ 3 issues de alta prioridad listos para trabajar
⚠️ 2 issues bloqueados - revisar dependencias
📋 Considera contactar al cliente para desbloquear el issue #206
```

## Notas de Implementación

El comando `/priorities` implementa la siguiente lógica:

1. **Obtención de datos**: Lista todos los issues abiertos con `gh issue list`
2. **Clasificación**: Ordena por prioridad (critical > high > medium > low)
3. **Desempate**: Si hay múltiples issues con la misma prioridad:
   - Prioriza issues asignados al usuario actual
   - Luego issues en estado `ready`
   - Luego por antigüedad (más antiguos primero)
   - Issues bloqueados van al final
4. **Presentación**: Muestra los 3 más urgentes con formato rico
5. **Estadísticas**: Calcula distribución y métricas generales
6. **Sugerencias**: Propone acciones concretas basadas en el análisis
