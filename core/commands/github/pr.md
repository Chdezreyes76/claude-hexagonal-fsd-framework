---
description: Crear Pull Request vinculado al issue actual
allowed-tools: Bash(gh pr:*), Bash(gh issue:*), Bash(git:*), Read
---

# Crear Pull Request

El usuario quiere crear un PR para el trabajo actual. Argumentos: $ARGUMENTS

## Instrucciones

1. **Obtener branch actual**:
   ```
   git branch --show-current
   ```

2. **Extraer numero de issue del nombre de branch**:
   - Formato esperado: `tipo/NUMERO-descripcion`
   - Extraer el numero (ej: de `feat/42-filtro-fecha` extraer `42`)

3. **Verificar estado del repo**:
   ```
   git status
   ```
   - Si hay cambios sin commit, avisar al usuario
   - Verificar que hay commits para pushear

4. **Obtener informacion del issue vinculado**:
   ```
   gh issue view <numero> --json title,labels,body
   ```

5. **Analizar commits de la branch**:
   ```
   git log main..HEAD --oneline
   ```

6. **Invocar agente code-reviewer** (si existe):
   - Hacer pre-review de los cambios antes de crear el PR

7. **Push de la branch**:
   ```
   git push -u origin <branch-actual>
   ```

8. **Crear el PR**:
   ```
   gh pr create --title "<tipo>(scope): <descripcion>" --body "..."
   ```

   **Formato del body**:
   ```
   Closes #<issue>

   ## Summary
   - Bullet points de los cambios principales

   ## Changes
   - Lista de archivos/componentes modificados

   ## Test Plan
   - [ ] Tests unitarios
   - [ ] Tests de integracion
   - [ ] Prueba manual

   ---
   Generated with Claude Code
   ```

9. **Actualizar labels del issue**:
   ```
   gh issue edit <numero> --add-label "status: in-review"
   ```

10. **Mostrar al usuario**:
    - URL del PR creado
    - Issue vinculado
    - Siguiente paso: esperar review o mergear si tiene permisos

## Ejemplo de uso

```
/pr
/pr --draft
```

## Notas

- El PR se vincula automaticamente al issue usando `Closes #<numero>`
- El titulo sigue Conventional Commits: `tipo(scope): descripcion`
- Si se usa `--draft`, se crea como draft PR
