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
   - Si hay conflictos (`mergeable` != `MERGEABLE`), **DETENER** y avisar al usuario
   - Guardar `headRefName` (branch del PR) y `baseRefName` (branch destino, usualmente master)

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
