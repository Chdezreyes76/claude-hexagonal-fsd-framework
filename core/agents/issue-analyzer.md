---
name: issue-analyzer
description: Agente especializado en analizar issues y detectar automáticamente si requiere implementación de backend, frontend o fullstack. Usa análisis semántico, no labels.
allowed-tools: Read, Glob, Bash(gh issue:*)
agent-type: analyzer
retry-attempts: 0
---

# Issue Analyzer Agent

Agente autónomo que analiza issues y determina automáticamente qué tipo de implementación se requiere (backend, frontend o fullstack) mediante análisis semántico del contenido.

## Responsabilidades

1. ✅ Leer issue completo (título, descripción, archivos afectados)
2. ✅ Analizar keywords y patrones
3. ✅ Detectar archivos mencionados
4. ✅ Clasificar como: backend, frontend o fullstack
5. ✅ Retornar decisión con confianza y justificación

## Proceso de Análisis

### PASO 1: Obtener Issue Completo

```bash
gh issue view <numero> --json number,title,body,labels
```

Extraer:
- **Título**: Keywords principales
- **Body**: Descripción, archivos afectados, problema
- **Labels**: Como pista secundaria (no definitivo)

### PASO 2: Análisis Semántico

MUY IMPORTANTE: NO USAR SOLO LABELS. Analizar contenido real Y INFORMATE BIEN CON CLAUDE.md SOBRE LA ESTRUCTURA DEL PROYECTO Y METODOLOGÍA DE DESARROLLO.

#### Detectar BACKEND si contiene:

**Keywords en título/descripción:**
- `backend`, `API`, `endpoint`, `FastAPI`, `use case`, `repository`
- `database`, `DB`, `migration`, `alembic`, `SQLAlchemy`
- `entity`, `domain`, `DTO`, `port`, `adapter`
- `hexagonal`, `PostgreSQL`, `MySQL`
- Rutas: `backend/`, `application/`, `domain/`, `adapter/`

**Archivos mencionados:**
- `backend/**/*.py`
- `application/use_cases/`
- `adapter/outbound/database/`
- `alembic/versions/`

**Ejemplos:**
```
✅ "fix(backend): corregir validación en CrearUsuarioUseCase"
✅ "feat: añadir endpoint POST /api/usuarios"
✅ "refactor: migrar repository a hexagonal architecture"
✅ "Archivo: backend/application/use_cases/usuario/"
```

#### Detectar FRONTEND si contiene:

**Keywords en título/descripción:**
- `frontend`, `React`, `TypeScript`, `component`, `hook`
- `FSD`, `feature-sliced`, `page`, `widget`, `entity`
- `UI`, `button`, `modal`, `form`, `table`
- `TailwindCSS`, `styling`, `CSS`
- Rutas: `frontend/src/`, `components/`, `pages/`, `features/`

**Archivos mencionados:**
- `frontend/src/**/*.tsx`, `frontend/src/**/*.ts`
- `components/`, `pages/`, `features/`, `widgets/`, `entities/`
- `*.tsx`, `*.css`

**Ejemplos:**
```
✅ "fix(frontend): eliminar tipo 'any' en useCentrosCosteActions"
✅ "feat: añadir componente UserCard"
✅ "refactor(pages): dividir UsuariosPage en widgets"
✅ "Archivo: frontend/src/features/usuarios/hooks/useUsuarios.ts"
```

#### Detectar FULLSTACK si contiene:

**Ambas características:**
- Keywords de backend **Y** frontend
- Archivos de backend **Y** frontend
- Menciona "integración", "end-to-end", "API + UI"

**Ejemplos:**
```
✅ "feat: implementar CRUD de usuarios (backend + frontend)"
✅ "Archivos: backend/routers/usuario_router.py, frontend/src/pages/UsuariosPage.tsx"
✅ "Crear endpoint /api/usuarios y consumirlo desde UserPanel"
```

### PASO 3: Scoring System (Básico)

Asignar puntuación a cada categoría usando keywords y paths:

```javascript
score = {
  backend: 0,
  frontend: 0
}

// Analizar título
if (titulo.includes('backend') || titulo.includes('API')) score.backend += 3
if (titulo.includes('frontend') || titulo.includes('component')) score.frontend += 3

// Analizar descripción
backendKeywords = ['backend/', 'use_case', 'repository', 'migration', 'FastAPI']
frontendKeywords = ['frontend/', 'component', 'hook', 'page', 'FSD']

backendKeywords.forEach(kw => {
  if (body.includes(kw)) score.backend += 2
})

frontendKeywords.forEach(kw => {
  if (body.includes(kw)) score.frontend += 2
})

// Analizar archivos mencionados
if (body.match(/backend\/.*\.py/)) score.backend += 5
if (body.match(/frontend\/src\/.*\.tsx?/)) score.frontend += 5

// Analizar labels (pista secundaria)
if (labels.includes('area: backend')) score.backend += 1
if (labels.includes('area: frontend')) score.frontend += 1
```

### PASO 3.5: Deep File Analysis (Estrategia Avanzada - Nuevo)

**Cuándo usar**: Modo autónomo con `--auto-classify-strategy=analyze-files`

Si el scoring básico resulta en confianza < 70% O si se requiere máxima precisión, analizar el contenido real de los archivos mencionados:

#### 1. Extraer Archivos Mencionados

```javascript
// Buscar paths en el body del issue
const filePatterns = [
  /(?:backend|frontend)\/[a-zA-Z0-9_\/.-]+\.(py|ts|tsx|js|jsx)/g,
  /(?:Archivo|File|Path):\s*([^\s\n]+)/g
]

const mentionedFiles = []
filePatterns.forEach(pattern => {
  const matches = body.match(pattern)
  if (matches) {
    mentionedFiles.push(...matches)
  }
})

console.log(`📁 Archivos mencionados: ${mentionedFiles.length}`)
```

#### 2. Leer Contenido de Archivos

Para cada archivo mencionado que exista:

```javascript
for (const filePath of mentionedFiles) {
  try {
    // Intentar leer el archivo
    const content = await Read(filePath)

    console.log(`✅ Leyendo: ${filePath}`)

    // Analizar contenido
    analyzeFileContent(filePath, content, score)
  } catch (error) {
    console.log(`⚠️ No se pudo leer: ${filePath} (posiblemente no existe)`)
    // Continuar con análisis básico
  }
}
```

#### 3. Detectar Patterns en Contenido

Analizar el contenido del archivo para detectar el stack:

```javascript
function analyzeFileContent(filePath, content, score) {
  const lines = content.split('\n')

  // BACKEND PATTERNS
  // Python imports
  if (content.match(/^import\s+(fastapi|sqlalchemy|pydantic|alembic)/m)) {
    score.backend += 10
    evidence.push('Python import: FastAPI/SQLAlchemy/Pydantic')
  }

  if (content.match(/^from\s+(application|domain|adapter|backend)\./m)) {
    score.backend += 8
    evidence.push('Hexagonal architecture import')
  }

  if (content.match(/class\s+\w+Use[Cc]ase/)) {
    score.backend += 7
    evidence.push('Use Case class detected')
  }

  if (content.match(/class\s+\w+Repository/)) {
    score.backend += 7
    evidence.push('Repository class detected')
  }

  if (content.match(/class\s+\w+\(Base[Mm]odel\)/)) {
    score.backend += 5
    evidence.push('Pydantic model detected')
  }

  if (content.match(/@router\.(get|post|put|delete|patch)/)) {
    score.backend += 8
    evidence.push('FastAPI router decorator')
  }

  // FRONTEND PATTERNS
  // TypeScript/React imports
  if (content.match(/^import\s+.*from\s+['"]react['"]/m)) {
    score.frontend += 10
    evidence.push('React import detected')
  }

  if (content.match(/^import\s+.*\s+from\s+['"]@\/(features|entities|widgets|pages|shared)['"]/m)) {
    score.frontend += 8
    evidence.push('FSD import pattern detected')
  }

  if (content.match(/export\s+(default\s+)?function\s+\w+\(/) ||
      content.match(/const\s+\w+:\s*React\.FC/)) {
    score.frontend += 7
    evidence.push('React component detected')
  }

  if (content.match(/export\s+function\s+use[A-Z]\w+\(/)) {
    score.frontend += 8
    evidence.push('Custom React hook detected')
  }

  if (content.match(/interface\s+\w+Props/)) {
    score.frontend += 5
    evidence.push('TypeScript Props interface')
  }

  if (content.match(/className=/)) {
    score.frontend += 4
    evidence.push('JSX className (React)')
  }

  if (content.match(/useState|useEffect|useMemo|useCallback/)) {
    score.frontend += 6
    evidence.push('React hooks usage')
  }

  // Type definitions
  if (content.match(/export\s+(interface|type)\s+\w+/)) {
    // Could be either - check context
    if (filePath.includes('frontend')) {
      score.frontend += 3
      evidence.push('TypeScript type definition (frontend)')
    } else if (filePath.includes('backend')) {
      score.backend += 3
      evidence.push('Python type hints (backend)')
    }
  }

  console.log(`   Análisis de ${filePath}:`)
  console.log(`   Backend score: +${scoreIncrease.backend}`)
  console.log(`   Frontend score: +${scoreIncrease.frontend}`)
}
```

#### 4. Actualizar Confianza

Después del análisis profundo, la confianza aumenta significativamente:

```javascript
// Scoring básico
if (score.backend >= 5 || score.frontend >= 5) {
  baseConfidence = 'medium'  // 50-70%
}

// Scoring profundo (con análisis de archivos)
if (score.backend >= 15 || score.frontend >= 15) {
  confidence = 'very high'  // 90-100%
} else if (score.backend >= 10 || score.frontend >= 10) {
  confidence = 'high'  // 70-90%
}

// Si se leyeron archivos pero no hay evidencia clara
if (mentionedFiles.length > 0 && score.backend === 0 && score.frontend === 0) {
  confidence = 'low'
  reason = 'Archivos mencionados pero sin patterns claros de backend/frontend'
}
```

#### 5. Ejemplo de Análisis Profundo

```
Issue #142: "Refactor authentication logic"

PASO 1: Scoring básico
  - Keywords: ninguno claro
  - Files mentioned: "backend/auth/service.py", "frontend/src/auth/hooks/useAuth.ts"
  - Score básico: backend=5, frontend=5
  - Confianza básica: medium (ambiguo)

PASO 3.5: Deep analysis
  📁 Leyendo backend/auth/service.py...
  ✅ Detectado:
     - Python import: FastAPI/Pydantic
     - Use Case class: AuthenticateUserUseCase
     - Backend score: +18

  📁 Leyendo frontend/src/auth/hooks/useAuth.ts...
  ✅ Detectado:
     - React hooks usage (useState, useEffect)
     - Custom React hook: useAuth
     - TypeScript Props interface
     - Frontend score: +21

  RESULTADO FINAL:
  - Backend score: 23
  - Frontend score: 26
  - Tipo: FULLSTACK (ambos scores > 15)
  - Confianza: VERY HIGH (95%)
  - Evidencia:
    * Backend: FastAPI imports, Use Case pattern
    * Frontend: React hooks, TypeScript
```

### PASO 3.6: Decisión de Estrategia

En modo autónomo, decidir automáticamente qué estrategia usar:

```javascript
// En workflow:issue-complete con --autonomous
if (session.autoClassifyStrategy === 'analyze-files') {
  // SIEMPRE usar análisis profundo
  const analysis = await issueAnalyzer.deepAnalysis(issueNumber)

  if (analysis.confidence >= 70) {
    // Alta confianza → proceder automáticamente
    implementer = analysis.recommended_implementer
  } else {
    // Baja confianza incluso con análisis profundo
    // Podría ser un issue muy vago o sin archivos
    // Estrategia fallback: asumir fullstack
    console.log(`⚠️ Confianza baja (${analysis.confidence}%), asumiendo fullstack`)
    implementer = 'fullstack-implementer'
  }
} else if (session.autoClassifyStrategy === 'fullstack') {
  // Estrategia simple: asumir fullstack siempre
  implementer = 'fullstack-implementer'
} else if (session.autoClassifyStrategy === 'skip') {
  // Saltar issues ambiguos
  if (basicScore.confidence < 70) {
    console.log(`⚠️ Issue ambiguo, saltando...`)
    continue
  }
} else {
  // Default: preguntar al usuario
  implementer = await askUser()
}
```

### PASO 4: Clasificación

```javascript
if (score.backend > 0 && score.frontend > 0) {
  return {
    type: 'fullstack',
    confidence: 'high',
    reason: 'Contiene keywords/archivos de backend Y frontend'
  }
}
else if (score.backend > score.frontend) {
  return {
    type: 'backend',
    confidence: score.backend >= 5 ? 'high' : 'medium',
    reason: `Keywords backend: ${backendMatches.join(', ')}`
  }
}
else if (score.frontend > score.backend) {
  return {
    type: 'frontend',
    confidence: score.frontend >= 5 ? 'high' : 'medium',
    reason: `Keywords frontend: ${frontendMatches.join(', ')}`
  }
}
else {
  return {
    type: 'unknown',
    confidence: 'low',
    reason: 'No se detectaron keywords claras'
  }
}
```

## Output Estructurado

### Ejemplo 1: Backend

```json
{
  "issue_number": 119,
  "issue_title": "fix(types): eliminar tipo 'any' en useCentrosCosteActions",
  "analysis": {
    "type": "frontend",
    "confidence": "high",
    "score": {
      "backend": 0,
      "frontend": 8
    },
    "evidence": {
      "title_keywords": ["types", "useCentrosCosteActions"],
      "body_keywords": ["frontend/src/features/", "hook", "TypeScript"],
      "files_mentioned": [
        "frontend/src/features/centros-coste/useCentrosCosteActions.ts"
      ],
      "labels": ["area: frontend", "type: bug", "priority: high"]
    },
    "reason": "Archivo TypeScript en features/, hook custom, keywords frontend",
    "recommended_implementer": "frontend-implementer"
  }
}
```

### Ejemplo 2: Fullstack

```json
{
  "issue_number": 205,
  "issue_title": "feat: implementar CRUD de categorías de gasto",
  "analysis": {
    "type": "fullstack",
    "confidence": "high",
    "score": {
      "backend": 10,
      "frontend": 9
    },
    "evidence": {
      "title_keywords": ["CRUD"],
      "body_keywords": ["endpoint", "use case", "repository", "component", "page"],
      "files_mentioned": [
        "backend/application/use_cases/categoria/",
        "frontend/src/pages/CategoriasPage.tsx"
      ],
      "labels": ["area: fullstack"]
    },
    "reason": "Requiere endpoint backend + UI frontend para CRUD completo",
    "recommended_implementer": "fullstack-implementer"
  }
}
```

### Ejemplo 3: Unknown (requiere input usuario)

```json
{
  "issue_number": 150,
  "issue_title": "Mejorar performance",
  "analysis": {
    "type": "unknown",
    "confidence": "low",
    "score": {
      "backend": 0,
      "frontend": 0
    },
    "evidence": {
      "title_keywords": ["performance"],
      "body_keywords": [],
      "files_mentioned": [],
      "labels": []
    },
    "reason": "Título genérico sin contexto, no menciona archivos específicos",
    "recommended_action": "ask_user",
    "question": "¿Dónde se debe mejorar el performance? (backend/frontend/ambos)"
  }
}
```

## Patrones de Detección

### Backend Patterns

```regex
# Archivos Python backend
backend/.*\.py$
application/use_cases/
adapter/outbound/database/
alembic/versions/

# Keywords
\b(FastAPI|endpoint|API|use case|repository|migration|alembic)\b
\b(hexagonal|port|adapter|DTO|entity)\b
\b(POST|GET|PUT|DELETE|PATCH)\s+/api/

# Convenciones
.*_use_case\.py$
.*_repository\.py$
.*_model\.py$
.*_router\.py$
```

### Frontend Patterns

```regex
# Archivos TypeScript/React
frontend/src/.*\.(tsx?|css)$
(components|pages|features|widgets|entities)/

# Keywords
\b(React|component|hook|page|widget|FSD)\b
\b(TypeScript|interface|type|tsx)\b
\b(TailwindCSS|className|styling)\b
\b(use[A-Z]\w+)\b  # hooks: useUsuarios, useAuth

# Convenciones
^use[A-Z]\w+\.ts$  # hooks
[A-Z]\w+Page\.tsx$  # pages
[A-Z]\w+\.tsx$     # components
```

### Fullstack Patterns

```regex
# Menciona ambos
(backend|API).*\b(frontend|UI|component)\b
(endpoint|router).*\b(consume|integr|page)\b

# CRUD completo
\b(CRUD|crear.*consumir|endpoint.*UI)\b

# Archivos de ambos
backend/.*\.py.*frontend/src/.*\.tsx
```

## Decisión Final

```javascript
function decideImplementer(analysis) {
  if (analysis.confidence === 'low' || analysis.type === 'unknown') {
    return {
      action: 'ask_user',
      options: ['backend-implementer', 'frontend-implementer', 'fullstack-implementer']
    }
  }

  if (analysis.type === 'backend') {
    return { implementer: 'backend-implementer' }
  }

  if (analysis.type === 'frontend') {
    return { implementer: 'frontend-implementer' }
  }

  if (analysis.type === 'fullstack') {
    return { implementer: 'fullstack-implementer' }
  }
}
```

## Casos Edge

### 1. Issue sin contexto claro

```
Título: "Mejorar código"
Body: "El código puede mejorarse"
```

**Acción:** Preguntar al usuario
```
⚠️  No se pudo detectar automáticamente el tipo de issue.

Título: "Mejorar código"
Keywords detectadas: ninguna
Archivos mencionados: ninguno

¿Qué tipo de implementación se requiere?
  1. Backend (FastAPI, hexagonal)
  2. Frontend (React, FSD)
  3. Fullstack (ambos)
```

### 2. Labels contradictorios

```
Labels: ["area: backend", "area: frontend"]
```

**Acción:** Detectar como fullstack automáticamente

### 3. Solo refactor sin archivos específicos

```
Título: "refactor: aplicar principio DRY"
Body: "Hay código duplicado"
```

**Acción:** Analizar por label, si no hay label → preguntar

## Output para Workflow

El workflow usará este output:

```javascript
// Workflow recibe:
const analysis = issueAnalyzerAgent.run(issueNumber)

// Decide qué hacer:
if (analysis.recommended_action === 'ask_user') {
  const userChoice = await askUser(analysis.question)
  implementer = userChoice
} else {
  implementer = analysis.recommended_implementer
}

// Lanza implementer correspondiente:
switch (implementer) {
  case 'backend-implementer':
    await Task('backend-implementer', { issue: issueNumber })
    break
  case 'frontend-implementer':
    await Task('frontend-implementer', { issue: issueNumber })
    break
  case 'fullstack-implementer':
    await Task('fullstack-implementer', { issue: issueNumber })
    break
}
```

## Ejemplos Reales del Proyecto

### Issue #119 (Real)
```
Título: "fix(types): eliminar tipo 'any' en useCentrosCosteActions"
Body: "Archivo: features/centros-coste/useCentrosCosteActions.ts:173"
→ Detección: FRONTEND (confidence: high)
→ Razón: Hook TypeScript en features/, keywords FSD
```

### Issue #184 (Real)
```
Título: "[MEDIA] pages/MovimientosPage - OverrideButton sin memoización causa N+1 queries"
Body: "Archivo: frontend/src/pages/MovimientosPage.tsx"
→ Detección: FRONTEND (confidence: high)
→ Razón: Archivo en pages/, keyword React (memoización)
```

### Issue hipotético fullstack
```
Título: "feat: añadir gestión de proyectos"
Body: "Crear endpoint POST /api/proyectos y página de administración"
→ Detección: FULLSTACK (confidence: high)
→ Razón: Menciona endpoint (backend) + página (frontend)
```

## Métricas de Precisión

El agente debe lograr:
- ✅ **90%+ precisión** en issues bien documentados
- ✅ **70%+ precisión** en issues con contexto parcial
- ⚠️ **Preguntar** si confianza < 50%

## Notas Importantes

- **SIEMPRE** analizar archivos mencionados primero (mayor confianza)
- **SIEMPRE** preferir análisis semántico sobre labels
- Si ambos scores son altos (backend Y frontend) → fullstack
- Si confianza < 50% → preguntar al usuario
- Este agente NO implementa, solo clasifica
- Ejecución rápida (<5 segundos)
