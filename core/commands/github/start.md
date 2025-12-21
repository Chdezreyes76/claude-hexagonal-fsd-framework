---
description: Iniciar trabajo en un issue (crear branch, asignar)
allowed-tools: Bash(gh issue:*), Bash(git checkout:*), Bash(git branch:*), Bash(git status:*)
---

# Iniciar Trabajo en Issue

El usuario quiere comenzar a trabajar en un issue. Argumentos: $ARGUMENTS

## Instrucciones

1. **Obtener numero de issue**:
   - El argumento debe ser el numero de issue (ej: `42`)
   - Si no se proporciona, listar issues asignados al usuario

2. **Obtener informacion del issue**:
   ```
   gh issue view <numero> --json title,labels,body,state
   ```

3. **Determinar tipo de branch**:
   - Buscar label `type: *` en el issue
   - Mapeo: feature->feat, bug->fix, refactor->refactor, docs->docs, test->test, chore->chore
   - Default: feat

4. **Crear nombre de branch**:
   - Formato: `<tipo>/<issue#>-<titulo-slugificado>`
   - Ejemplo: `feat/42-filtro-fecha-nominas`
   - Maximo 50 caracteres en el slug

5. **Verificar estado del repo**:
   ```
   git status
   ```
   - Si hay cambios sin commit, avisar al usuario

6. **Crear y cambiar a la branch**:
   ```
   git checkout -b <nombre-branch>
   ```

7. **Asignar el issue al usuario actual**:
   ```
   gh issue edit <numero> --add-assignee @me
   ```

8. **Actualizar labels del issue**:
   ```
   gh issue edit <numero> --remove-label "status: needs-triage" --remove-label "status: ready"
   ```

9. **Invocar al agente issue-planner**:
   - Usar Task tool con subagent_type="issue-planner" para analizar el issue
   - El agente propondra un plan de implementacion

10. **Mostrar al usuario**:
    - Branch creada
    - Issue asignado
    - Plan de implementacion propuesto
    - Recordar: commits deben incluir `#<issue>` en el mensaje

## Ejemplo de uso

```
/start 42
/start 15
```

## Convencion de branches

| Tipo | Prefijo |
|------|---------|
| feature | feat/ |
| bug | fix/ |
| refactor | refactor/ |
| docs | docs/ |
| test | test/ |
| chore | chore/ |
| spike | spike/ |
