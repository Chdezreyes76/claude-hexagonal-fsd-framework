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

## Instrucciones
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
  
## Detalles de actualizacion por documento

### CLAUDE.md:

#### 1. Análisis Inicial

1. **Leer estructura de documentación**:
   - Leer `CLAUDE.md` (raíz) para entender la organización
   - Leer `docs/claude/00-estructura.md` (si existe) para conocer la arquitectura documental
   - Identificar todos los archivos .md en `docs/claude/`

2. **Analizar cambios recientes**:
   - Revisar commits desde el último release/tag
   - Identificar archivos modificados, creados o eliminados
   - Detectar cambios en:
     - Estructura de carpetas/archivos
     - Configuraciones (package.json, requirements.txt, docker-compose.yml, etc.)
     - Migraciones de base de datos
     - Nuevos endpoints/rutas
     - Nuevos componentes/features
     - Tests añadidos/modificados
     - Dependencias actualizadas

#### 2. Mapeo de Cambios a Documentación

**Para cada cambio detectado**, determinar qué documentos requieren actualización:

##### Cambios en Backend
- **Nuevos endpoints/rutas** → actualizar workflow de nuevo endpoint, arquitectura backend
- **Nuevas tablas/migraciones** → actualizar base de datos, workflow de nueva tabla
- **Nuevos módulos/dominios** → actualizar dominios de negocio, arquitectura
- **Cambios en DTOs/modelos** → actualizar patrones de respuesta, convenciones
- **Nuevas dependencias** → actualizar instalación, stack tecnológico
- **Cambios en seguridad** → actualizar documentación de seguridad
- **Nuevos tests** → actualizar testing backend

##### Cambios en Frontend
- **Nuevos componentes** → actualizar componentes UI, convenciones frontend
- **Nuevas features/pages** → actualizar arquitectura FSD, estructura
- **Cambios en routing** → actualizar arquitectura, workflows
- **Nuevos hooks** → actualizar convenciones, buenas prácticas
- **Cambios en gestión de estado** → actualizar patrones, arquitectura
- **Nuevas dependencias** → actualizar instalación, stack tecnológico
- **Nuevos tests** → actualizar testing frontend

##### Cambios en Infraestructura
- **Docker/compose** → actualizar instalación, configuración
- **Variables de entorno** → actualizar instalación, configuración
- **CI/CD** → actualizar releases, git workflow
- **Base de datos** → actualizar configuración BD, migraciones

##### Cambios en Git/Procesos
- **Nuevos tipos de commits** → actualizar convenciones de commits
- **Cambios en branching** → actualizar estrategia de branches
- **Proceso de release** → actualizar releases

#### 3. Criterios de Actualización

**Actualizar documento SI**:
- ✅ El cambio afecta directamente el contenido del documento
- ✅ Se añadieron features/módulos que deben documentarse
- ✅ Se modificaron convenciones o patrones
- ✅ Se actualizó la arquitectura o estructura
- ✅ Se añadieron/modificaron configuraciones

**NO actualizar documento SI**:
- ❌ El cambio es solo un bugfix sin impacto estructural
- ❌ Solo se modificaron comentarios en código
- ❌ Cambios menores de estilo/formato
- ❌ El documento ya contiene la información actualizada

#### 4. Actualización de Documentos

Para cada documento identificado:

1. **Leer contenido actual** del documento
2. **Identificar secciones afectadas** por los cambios
3. **Actualizar información obsoleta**:
   - Añadir nuevas features/módulos
   - Actualizar ejemplos de código
   - Corregir información desactualizada
   - Añadir nuevas secciones si es necesario
4. **Mantener límites de tamaño**:
   - Documentos individuales: 100-300 líneas
   - Si excede: sugerir división en múltiples archivos
5. **Verificar consistencia**:
   - Enlaces internos funcionando
   - Referencias cruzadas correctas
   - Formato markdown uniforme

#### 5. Actualización del Índice Principal

Después de actualizar documentos específicos:

1. **Leer CLAUDE.md** actual
2. **Actualizar resúmenes** si el contenido cambió significativamente
3. **Añadir nuevas secciones** si se crearon documentos nuevos
4. **Verificar enlaces** a todos los documentos
5. **Actualizar fecha** de última actualización
6. **Mantener estructura** (máx. 150 líneas)

---

### 📐 Estándares de Formato

#### Estructura de Documentos
- **Título principal** (H1): nombre descriptivo
- **Tabla de contenidos**: si >100 líneas
- **Secciones claras** (H2, H3): jerarquía lógica
- **Ejemplos de código**: con syntax highlighting
- **Notas importantes**: usar callouts (✅, ⚠️, 🚨)

#### Convenciones de Escritura
- **Idioma**: según idioma del proyecto (detectar automáticamente)
- **Tiempo verbal**: presente indicativo
- **Tono**: técnico pero accesible
- **Código inline**: usar backticks `código`
- **Bloques de código**: especificar lenguaje
```language
código
```

#### Enlaces
- **Internos**: relativos desde raíz del proyecto
  - Ejemplo: `[Ver arquitectura](docs/claude/02-arquitectura/arquitectura-general.md)`
- **Externos**: URLs completas con descripción clara
- **Verificar**: que todos los enlaces apunten a archivos existentes

---

### 🔍 Validaciones Finales

Antes de finalizar:

1. ✅ Todos los documentos actualizados respetan límites de tamaño
2. ✅ CLAUDE.md refleja la estructura actual
3. ✅ No hay enlaces rotos
4. ✅ Formato markdown es consistente
5. ✅ Ejemplos de código son válidos
6. ✅ Fecha de última actualización está actualizada
7. ✅ No hay información contradictoria entre documentos

---

### 📊 Reporte de Actualización

Al finalizar, generar un resumen con:
```markdown
### 📝 Documentación Actualizada

#### Cambios Detectados
- [Tipo de cambio]: [Descripción breve]
- ...

#### Documentos Actualizados
- ✏️ [ruta/documento.md]: [razón de actualización]
- ...

#### Documentos Nuevos
- ✨ [ruta/documento.md]: [propósito]
- ...

#### Validaciones
- ✅ Límites de tamaño respetados
- ✅ Enlaces verificados
- ✅ CLAUDE.md actualizado
- ✅ Formato consistente

#### Recomendaciones
- [Si aplica: sugerencias de mejora]
```

---

### ⚙️ Configuración

El comando debe:
- **Ser no-invasivo**: solo actualizar lo necesario
- **Preservar contenido**: no eliminar información válida
- **Ser reversible**: cambios revisables antes de commit
- **Ser consistente**: seguir siempre la misma lógica
- **Ser informativo**: explicar qué se actualizó y por qué

---

### 🚨 Casos Especiales

#### Restructuración Mayor
Si se detectan cambios arquitecturales importantes:
1. Sugerir revisión manual de la documentación completa
2. Destacar documentos que requieren atención especial
3. No hacer cambios automáticos masivos sin confirmación

#### Documentos Faltantes
Si se detecta funcionalidad sin documentar:
1. Identificar el documento apropiado según `00-estructura.md`
2. Sugerir creación de nuevo documento
3. Proporcionar estructura base con contenido mínimo

#### Documentos Obsoletos
Si se detectan documentos de features eliminadas:
1. Marcar para revisión
2. Sugerir eliminación o archivado
3. Actualizar CLAUDE.md si se elimina

---

### 📌 Notas Importantes

- Este proceso debe ejecutarse **después de cada release** o cambio significativo
- Los cambios son **sugerencias** que deben revisarse antes de commit
- La documentación es **código**: merece el mismo cuidado que el código fuente
- Priorizar **claridad** sobre exhaustividad
- Mantener documentos **accionables** (con ejemplos prácticos)


## **README.md**:
   - Este documento es la documentacion principal del proyecto y debe incluir:
     - Titulo del proyecto.
     - Descripcion breve del proyecto.
     - Caracteristicas principales.
     - Tecnologias utilizadas.
     - Instrucciones de instalacion y configuracion.
     - Guia de uso basica.
     - Contribuciones y como contribuir al proyecto.
     - Licencia del proyecto.

## **CHANGELOG.md**:
   - Este documento registra todos los cambios realizados en el proyecto y debe incluir:
     - Versiones del proyecto.
     - Fechas de lanzamiento.
     - Descripcion sucinta de los cambios realizados en cada version (nuevas funcionalidades, mejoras, correcciones de errores, etc.).
       - Cada release debe estar claramente documentado en la carpeta docs/releases/ con un archivo markdown que detalle los cambios de esa version.
     - Notas adicionales relevantes para los usuarios o desarrolladores.

## **Documentos nuevos**:
   - Si el usuario especifica un documento que no es CLAUDE.md, README.md o CHANGELOG.md, debemos crear un archivo nuevo en la carpeta docs/ con el nombre especificado.
   - El contenido base del nuevo documento debe incluir:
     - Titulo del documento.
     - Proposito del documento.
     - Secciones sugeridas para el contenido del documento (el usuario podra completarlas posteriormente).
  
## Instrucciones adicionales obligatorias
- Asegurarse de que todos los documentos actualizados o creados esten en formato markdown (.md).
- Utilizar un lenguaje claro y conciso en los mensajes al usuario.
- Verificar que la estructura de carpetas y archivos del proyecto se mantenga organizada y coherente.
- No incluir contenido irrelevante o fuera de contexto en los documentos.

