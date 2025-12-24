---
allowed-tools: Bash(cd:*). Bash(mkdir:*), Bash(cp:*), Bash(touch:*), Bash(cat:*), Bash(echo:*)
argument-hint: |
  Especifica el documento a actualizar. Opciones:
    - `CLAUDE.md` - Documentacion de Claude
    - `README.md` - Documentacion principal del proyecto
    - `CHANGELOG.md` - Registro de cambios del proyecto
  - `all` - Actualizar todos los documentos disponibles
description: Actualiza la documentacion especificada en el proyecto.
---

El usuario quiere actualizar la documentacion del proyecto. Argumentos: $ARGUMENTS

### Instrucciones
1. **Determinar documento a actualizar**:
   - Si el argumento es `all`, actualizar todos los documentos disponibles.
   - Si el argumento es un nombre de archivo especifico (ej. `CLAUDE.md`, `README.md`, `CHANGELOG.md`), actualizar solo ese archivo.
   - Si el argumento es cualquier otro documento solicitado debemos crearlo en la carpeta docs/ si no existe.
2. **Actualizar documentos**:
    - Para cada documento a actualizar:
      1. Verificar si el archivo existe en la raiz del proyecto para los archivos CHANGELOG.md, README.md y CLAUDE.md.
      2. Si no existe, crear un archivo nuevo con contenido base sobre el propósito del documento.
      3. Si existe, abrir el archivo y agregar una seccion de "Ultima Actualizacion" con la fecha y hora actual al principio del documento.
      4. Revisar el contenido del documento y asegurarse de que este actualizado con la informacion mas reciente del proyecto.
      5. Guardar los cambios.
3. **Confirmar actualizacion**:
   - Mostrar al usuario un mensaje confirmando que los documentos han sido actualizados exitosamente.
   - Listar los documentos que fueron actualizados.
   - Si se creo algun documento nuevo, informar al usuario.


