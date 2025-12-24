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
      4. Revisar el contenido del documento y asegurarse de que este actualizado con la informacion mas reciente del proyecto, el detalle de lo que hay que actualizar esta en las secciones correspondientes a cada documento más abajo.      5. Guardar los cambios.
3. **Confirmar actualizacion**:
   - Mostrar al usuario un mensaje confirmando que los documentos han sido actualizados exitosamente.
   - Listar los documentos que fueron actualizados.
   - Si se creo algun documento nuevo, informar al usuario.
  
### Detalles de actualizacion por documento
- **CLAUDE.md**:
   - Este documento proporciona la informacion básica necesaria para entender y dar un contexto general a Claude sobre el proyecto y debe incluir:
     - Descripcion del proyecto: una breve introduccion al proyecto incluyendo su proposito y alcance y objeto de dominio de negocio.
     - Arquitectura del sistema: un resumen de la arquitectura tecnica del proyecto, incluyendo los principales componentes y su stack tecnologico. Se debe incluir     diagramas si es posible sobre la estructura de backend y frontend. Esta seccion debe ser clara y concisa y actualizada siempre que haya cambios significativos en la arquitectura.
     - Instrucciones básicas de instalación del entorno de desarrollo.
     - Convenciones sobre namings y codificacion utilizadas en el proyecto (Strictly enforced) con los siguientes subapartados:
       - PARA BACKEND:
         - Estructura de carpetas y archivos.
         - Estilo de codificacion (nombres de variables, funciones, clases, etc.).
         - Uso de comentarios y documentacion en el codigo.
         - Convenciones generales para el desarrollo tade las capas de backend.
         - Buenas practicas recomendadas.
         - Cualquier otra convención relevante para el equipo de desarrollo backend.
         - ResponseDTO[T] y RequestDTO[T] para estandarizar las respuestas y peticiones de los endpoints.
       - PARA FRONTEND:
         - Estructura de carpetas y archivos.
         - Estilo de codificacion (nombres de variables, funciones, clases, etc.).
         - Uso de comentarios y documentacion en el codigo.
         - Convenciones generales para el desarrollo tade las capas de frontend.
         - Buenas practicas recomendadas.
         - Dependency rules (strictly enforced) para manejar las dependencias entre modulos y componentes.
           - `pages/` can import from: widgets, features, entities, components
           - `widgets/` can import from: features, entities, components
           - `features/` can import from: entities, components
           - `entities/` can import from: components
           - `components/` should be self-contained (no business logic)
           - -Responsabilidades de cada una de las capas de frontend.
         - Cualquier otra convención relevante para el equipo de desarrollo frontend.
     - GENERALES:
       - Normas para commits y mensajes de commit.
       - Uso de branches y estrategias de ramificacion.
       - Proceso de revisiones de codigo (code reviews).
       - Criterios para merges y despliegues.
       - Cualquier otra convención relevante para el equipo de desarrollo en general.
 - **README.md**:
   - Este documento es la documentacion principal del proyecto y debe incluir:
     - Titulo del proyecto.
     - Descripcion breve del proyecto.
     - Caracteristicas principales.
     - Tecnologias utilizadas.
     - Instrucciones de instalacion y configuracion.
     - Guia de uso basica.
     - Contribuciones y como contribuir al proyecto.
     - Licencia del proyecto.
 - **CHANGELOG.md**:
   - Este documento registra todos los cambios realizados en el proyecto y debe incluir:
     - Versiones del proyecto.
     - Fechas de lanzamiento.
     - Descripcion sucinta de los cambios realizados en cada version (nuevas funcionalidades, mejoras, correcciones de errores, etc.).
       - Cada release debe estar claramente documentado en la carpeta docs/releases/ con un archivo markdown que detalle los cambios de esa version.
     - Notas adicionales relevantes para los usuarios o desarrolladores.
 - **Documentos nuevos**:
   - Si el usuario especifica un documento que no es CLAUDE.md, README.md o CHANGELOG.md, debemos crear un archivo nuevo en la carpeta docs/ con el nombre especificado.
   - El contenido base del nuevo documento debe incluir:
     - Titulo del documento.
     - Proposito del documento.
     - Secciones sugeridas para el contenido del documento (el usuario podra completarlas posteriormente).
  
### Ejemplo de mensaje de confirmacion
"Los siguientes documentos han sido actualizados exitosamente:
- CLAUDE.md
- README.md 
- CHANGELOG.md

Si se han creado nuevos documentos, se informara al usuario en el mensaje."

### Instrucciones adicionales obligatorias
- Asegurarse de que todos los documentos actualizados o creados esten en formato markdown (.md).
- Utilizar un lenguaje claro y conciso en los mensajes al usuario.
- Verificar que la estructura de carpetas y archivos del proyecto se mantenga organizada y coherente.
- No incluir contenido irrelevante o fuera de contexto en los documentos.

