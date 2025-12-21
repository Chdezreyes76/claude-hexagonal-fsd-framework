---
description: Crear un nuevo endpoint en un dominio existente
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Crear Nuevo Endpoint

El usuario quiere crear un nuevo endpoint. Argumentos: $ARGUMENTS

## Instrucciones

1. **Parsear argumentos**:
   - Formato: `<dominio> <accion>`
   - Ejemplo: `nominas obtener-detalle-mensual`
   - Accion en kebab-case, se convierte a snake_case para Python

2. **Verificar que el dominio existe**:
   - Buscar router en `backend/adapter/inbound/api/routers/{dominio}_router.py`
   - Si no existe, sugerir usar `/scaffold/new-domain` primero

3. **Generar nombres**:
   ```
   accion_snake: obtener_detalle_mensual
   accion_pascal: ObtenerDetalleMensual
   endpoint_path: /detalle-mensual
   ```

4. **Crear/Actualizar archivos Backend**:

   a. **Nuevo Use Case**:
      ```
      application/use_cases/{dominio}/{accion}_use_case.py
      ```

   b. **DTOs** (si se necesitan nuevos):
      ```
      application/dtos/{dominio}/{accion}_request_dto.py
      application/dtos/{dominio}/{accion}_response_dto.py
      ```

   c. **Actualizar Port** (si se necesita nuevo metodo):
      ```
      application/ports/{dominio}/{dominio}_port.py
      ```

   d. **Actualizar Repository** (implementar nuevo metodo):
      ```
      adapter/outbound/database/repositories/{dominio}_repository.py
      ```

   e. **Actualizar Router** (anadir endpoint):
      ```
      adapter/inbound/api/routers/{dominio}_router.py
      ```

   f. **Actualizar Dependencies**:
      ```
      adapter/inbound/api/dependencies/{dominio}/{dominio}_dependency.py
      ```

5. **Crear/Actualizar archivos Frontend**:

   a. **Actualizar Service**:
      ```
      services/{dominio}.service.ts
      ```

   b. **Crear Hook** (si es operacion nueva):
      ```
      hooks/use{Accion}.ts
      ```

6. **Determinar tipo de endpoint**:
   - GET (listar, obtener, buscar) -> Query
   - POST (crear, ejecutar) -> Mutation
   - PUT/PATCH (actualizar, modificar) -> Mutation
   - DELETE (eliminar, borrar) -> Mutation

7. **Mostrar al usuario**:
   - Archivos creados/modificados
   - Ejemplo de uso del endpoint
   - Ejemplo de uso del hook en React

## Ejemplo de Uso

```
/scaffold/new-endpoint nominas obtener-detalle-mensual
/scaffold/new-endpoint usuarios buscar-por-email
/scaffold/new-endpoint centros-coste calcular-redistribucion
```

## Notas

- Siempre leer el archivo existente antes de modificarlo
- Mantener el estilo y formato del codigo existente
- Anadir imports necesarios al principio del archivo
- Los endpoints GET no necesitan Request DTO si solo usan path/query params
