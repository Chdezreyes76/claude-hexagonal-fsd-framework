---
description: Mergear PR, hacer pull y limpiar ramas locales/remotas
allowed-tools: Bash(gh pr:*), Bash(git:*)
---

# Mergear Pull Request y Limpiar

El usuario quiere mergear un PR y limpiar ramas. Argumentos: $ARGUMENTS

## Instrucciones

1. **Determinar numero de PR**:
   - Si se proporciona argumento, usar ese numero de PR
   - Si NO se proporciona argumento, obtener PR de la branch actual:
     ```
     gh pr view --json number,title,state,mergeable,url
     ```

2. **Verificar estado del PR**:
   ```
   gh pr view <numero> --json number,title,state,mergeable,headRefName,baseRefName,url
   ```

   - Verificar que `state` sea `OPEN`
   - **IMPORTANTE**: Verificar que `mergeable` sea `MERGEABLE`
   - Guardar `headRefName` (branch del PR) y `baseRefName` (branch destino, usualmente master)
   - Si hay conflictos (`mergeable` != `MERGEABLE`):
     * En modo normal: **DETENER** y avisar al usuario
     * En modo autónomo (`--auto-resolve-conflicts`): Intentar resolverlos (ver sección Auto-Resolución)

3. **Verificar checks del PR**:
   ```
   gh pr checks <numero>
   ```
   - Si hay checks fallando, avisar al usuario pero permitir continuar si lo solicita

4. **Hacer merge del PR**:
   ```
   gh pr merge <numero> --merge --delete-branch
   ```

   **Opciones**:
   - `--merge`: Usar merge commit (mantiene historial completo)
   - `--delete-branch`: Eliminar branch remota automáticamente después del merge
   - Si falla, mostrar error y detener

5. **Cambiar a la branch base (master)**:
   ```
   git checkout <baseRefName>
   ```

6. **Actualizar branch base con pull**:
   ```
   git pull
   ```

7. **Eliminar branch local** (si existe y no es la actual):
   ```
   git branch -d <headRefName>
   ```

   - Si la branch no se puede eliminar con `-d`, usar `-D` para forzar
   - Si la branch no existe localmente, continuar sin error

8. **Verificar limpieza**:
   ```
   git branch -a | grep <headRefName>
   ```

   - Verificar que la branch no aparezca en local ni en remoto

9. **Mostrar resumen al usuario**:
   - PR mergeado exitosamente
   - URL del PR
   - Branch base actualizada
   - Ramas eliminadas (local y remota)

## Ejemplos de uso

```
/github:merge              # Mergea el PR de la branch actual
/github:merge 189          # Mergea el PR #189
```

## Auto-Resolución de Conflictos (Nuevo - Fase 5)

Cuando se detectan conflictos (`mergeable` != `MERGEABLE`) y el modo autónomo está activo, intentar resolverlos automáticamente.

### Paso 1: Detectar Conflictos

```bash
# Obtener información del PR
prInfo=$(gh pr view <numero> --json mergeable,headRefName,baseRefName)
mergeable=$(echo $prInfo | jq -r '.mergeable')

if [ "$mergeable" != "MERGEABLE" ]; then
  echo "⚠️ Conflictos detectados en PR #<numero>"

  if [ "$autoResolveConflicts" = "true" ]; then
    echo "🔧 Intentando resolución automática..."
    # Continuar con estrategias de resolución
  else
    echo "❌ Debes resolver los conflictos manualmente"
    exit 1
  fi
fi
```

### Paso 2: Preparar Branch Local

```bash
# Asegurar que estamos en la branch del PR
currentBranch=$(git branch --show-current)
headRefName=$(echo $prInfo | jq -r '.headRefName')
baseRefName=$(echo $prInfo | jq -r '.baseRefName')

if [ "$currentBranch" != "$headRefName" ]; then
  echo "Cambiando a branch $headRefName..."
  git checkout $headRefName
fi

# Actualizar desde remoto
git fetch origin
```

### Paso 3: Estrategias de Resolución (Progresivas)

Intentar estrategias en orden, desde la más segura hasta la más agresiva:

#### Estrategia 1: Rebase Automático (Preferida)

```bash
echo "📋 Estrategia 1: Rebase automático"

git rebase origin/$baseRefName

if [ $? -eq 0 ]; then
  echo "✅ Rebase exitoso sin conflictos"

  # Forzar push de la branch rebaseada
  git push --force-with-lease origin $headRefName

  # Esperar a que GitHub actualice el estado del PR
  sleep 5

  # Verificar si ahora es mergeable
  newMergeable=$(gh pr view <numero> --json mergeable | jq -r '.mergeable')

  if [ "$newMergeable" = "MERGEABLE" ]; then
    echo "✅ PR ahora es mergeable después de rebase"
    # Continuar con merge normal (paso 4)
    exit 0
  fi
else
  echo "⚠️ Rebase falló, intentando siguiente estrategia..."
  git rebase --abort
fi
```

#### Estrategia 2: Merge con Estrategia "Ours" (Conservadora)

Mantiene los cambios de nuestra branch en caso de conflicto:

```bash
echo "📋 Estrategia 2: Merge con estrategia 'ours'"

git merge origin/$baseRefName -X ours -m "chore: auto-resolve conflicts using ours strategy"

if [ $? -eq 0 ]; then
  echo "✅ Merge con estrategia 'ours' exitoso"

  # Push de los cambios
  git push origin $headRefName

  # Esperar y verificar
  sleep 5
  newMergeable=$(gh pr view <numero> --json mergeable | jq -r '.mergeable')

  if [ "$newMergeable" = "MERGEABLE" ]; then
    echo "✅ PR ahora es mergeable después de merge"
    exit 0
  fi
else
  echo "⚠️ Merge con 'ours' falló, intentando siguiente estrategia..."
  git merge --abort
fi
```

#### Estrategia 3: Análisis de Conflictos y Resolución Selectiva

```bash
echo "📋 Estrategia 3: Análisis selectivo de conflictos"

# Intentar merge para ver qué archivos tienen conflictos
git merge origin/$baseRefName --no-commit --no-ff 2>&1 | tee /tmp/merge_output.txt

if git diff --name-only --diff-filter=U | grep -q .; then
  # Hay archivos con conflictos
  conflictedFiles=$(git diff --name-only --diff-filter=U)

  echo "Archivos con conflictos:"
  echo "$conflictedFiles"

  # Clasificar archivos por tipo
  hasCodeConflicts=false
  hasConfigConflicts=false

  for file in $conflictedFiles; do
    case $file in
      *.py|*.ts|*.tsx|*.js|*.jsx)
        hasCodeConflicts=true
        ;;
      package.json|package-lock.json|requirements.txt|*.lock)
        hasConfigConflicts=true
        ;;
    esac
  done

  # Estrategia específica por tipo
  if [ "$hasConfigConflicts" = "true" ] && [ "$hasCodeConflicts" = "false" ]; then
    echo "🔧 Solo conflictos en archivos de configuración, usando 'theirs'"

    for file in $conflictedFiles; do
      case $file in
        package.json|package-lock.json|requirements.txt|*.lock)
          # Para archivos de dependencias, usar versión de master
          git checkout --theirs $file
          git add $file
          echo "  ✓ Resuelto $file (usando versión de master)"
          ;;
      esac
    done

    # Completar el merge
    git commit -m "chore: auto-resolve dependency conflicts using theirs"
    git push origin $headRefName

    sleep 5
    newMergeable=$(gh pr view <numero> --json mergeable | jq -r '.mergeable')

    if [ "$newMergeable" = "MERGEABLE" ]; then
      echo "✅ Conflictos resueltos, PR ahora es mergeable"
      exit 0
    fi
  else
    echo "⚠️ Conflictos en código fuente detectados"
    echo "   No es seguro resolver automáticamente"
    git merge --abort
  fi
else
  echo "✅ Merge completado sin conflictos"
  git commit -m "chore: auto-merge with master"
  git push origin $headRefName
  exit 0
fi
```

### Paso 4: Estrategia Final - Fallar Gracefully

Si todas las estrategias fallan:

```bash
echo "❌ No se pudieron resolver conflictos automáticamente"
echo ""
echo "Archivos con conflictos:"
echo "$conflictedFiles"
echo ""
echo "Opciones:"
echo "  1. Resolver manualmente en la branch $headRefName"
echo "  2. Saltar este issue (en modo autónomo)"
echo "  3. Convertir a Epic si es muy complejo"

# En modo autónomo del workflow
if [ "$autonomousMode" = "true" ]; then
  echo ""
  echo "⚠️ Modo autónomo: Saltando issue por conflictos no resueltos"
  # El workflow registrará este issue como saltado
  exit 2  # Exit code especial para "skip por conflictos"
fi

exit 1
```

### Registro de Estrategia Usada

Al finalizar exitosamente, registrar qué estrategia funcionó:

```bash
# Agregar comentario al PR
gh pr comment <numero> --body "🤖 Conflictos resueltos automáticamente usando estrategia: $usedStrategy

Detalles:
- Estrategia: $usedStrategy
- Archivos afectados: $conflictCount
- Timestamp: $(date)

Generated with Claude Code"
```

### Configuración

El modo de auto-resolución se activa con:

```bash
# En workflow:issue-complete con --autonomous
session.autoResolveConflicts = true

# O manualmente
/github:merge --auto-resolve-conflicts
```

### Seguridad y Límites

**Solo resolver automáticamente**:
- ✅ Conflictos en archivos de configuración (package.json, requirements.txt)
- ✅ Conflictos triviales (whitespace, formatting)
- ✅ Rebase limpio (sin conflictos)

**NO resolver automáticamente**:
- ❌ Conflictos en código fuente (.py, .ts, .tsx, etc.)
- ❌ Conflictos en múltiples archivos de código
- ❌ Conflictos complejos que afectan lógica de negocio

**Fallback**:
- Si no se puede resolver → Saltar issue en modo autónomo
- El issue queda registrado como "saltado por conflictos"
- Usuario puede revisar manualmente después

## Manejo de Errores

**Si hay conflictos**:
- Mensaje: "El PR #<numero> tiene conflictos. Debes resolverlos antes de hacer merge."
- NO continuar con el merge

**Si el PR está cerrado**:
- Mensaje: "El PR #<numero> ya está cerrado."
- NO continuar

**Si hay checks fallando**:
- Mensaje: "El PR #<numero> tiene checks fallando. ¿Deseas continuar de todas formas?"
- Esperar confirmación del usuario

**Si falla el merge**:
- Mostrar error de GitHub
- NO continuar con limpieza de branches

## Flujo Completo

```
Usuario en branch: chore/38-corregir-app-name-defaults
→ /github:merge

1. Detecta PR #189 de la branch actual
2. Verifica que no tenga conflictos ✓
3. Verifica checks ✓
4. Hace merge del PR
5. Elimina branch remota automáticamente
6. Cambia a master
7. Hace pull para actualizar
8. Elimina branch local chore/38-corregir-app-name-defaults
9. Muestra resumen: "✓ PR #189 mergeado, ramas limpiadas"
```

## Notas

- Por defecto usa `--merge` (merge commit) en lugar de squash o rebase
- La branch remota se elimina automáticamente con `--delete-branch`
- La branch local se elimina solo si el merge fue exitoso
- Si estás en la branch del PR, automáticamente cambia a la branch base antes de eliminar
- NUNCA elimina branches protegidas como master, main, develop
