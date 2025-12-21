---
description: Crear un nuevo issue en GitHub
allowed-tools: Bash(gh issue:*), Bash(gh label:*), Read
---

# Crear Issue en GitHub

El usuario quiere crear un issue. Argumentos recibidos: $ARGUMENTS

## Instrucciones

1. **Parsear los argumentos**:
   - Formato esperado: `<tipo> <titulo>` o solo `<titulo>`
   - Tipos validos: `feature`, `bug`, `refactor`, `spike`, `docs`, `test`, `chore`
   - Si no se especifica tipo, preguntar al usuario

2. **Leer el template correspondiente**:
   - Template en: `.claude/lib/templates/issues/<tipo>.md`
   - Si no existe template para ese tipo, usar uno generico

3. **Crear el issue con `gh issue create`**:
   ```
   gh issue create --title "<titulo>" --body "<contenido>" --label "type: <tipo>" --label "status: needs-triage"
   ```

4. **Aplicar labels adicionales segun el tipo**:
   - feature: `type: feature`
   - bug: `type: bug`
   - refactor: `type: refactor`
   - spike: `type: spike`

5. **Mostrar al usuario**:
   - Numero del issue creado
   - URL del issue
   - Labels aplicados
   - Siguiente paso sugerido: `/start <issue#>` para comenzar a trabajar

## Ejemplo de uso

```
/issue feature Añadir filtro por fecha en nominas
/issue bug Error al cargar usuarios sin rol asignado
/issue refactor Migrar autenticacion a arquitectura hexagonal
```

## Notas

- El issue se crea con label `status: needs-triage` por defecto
- El body del issue usa el template como base pero puede ser personalizado
- Si el titulo contiene palabras clave del dominio, sugerir labels de dominio
