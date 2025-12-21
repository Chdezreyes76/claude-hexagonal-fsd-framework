---
description: Revisar cambios de codigo segun patrones del proyecto
allowed-tools: Read, Glob, Grep, Bash(git:*)
---

# Revisar Codigo

El usuario quiere revisar los cambios de codigo. Argumentos: $ARGUMENTS

## Instrucciones

1. **Determinar alcance de revision**:
   - Sin argumentos: revisar todos los cambios pendientes (`git diff`)
   - Con archivo: revisar solo ese archivo
   - Con `--staged`: revisar solo cambios staged

2. **Obtener cambios**:
   ```bash
   git status
   git diff --name-only
   ```

3. **Invocar agente code-reviewer**:
   - Usar Task tool con el agente `code-reviewer`
   - El agente analizara los cambios y generara un reporte

4. **Mostrar resultados**:
   - Resumen de issues encontrados
   - Detalle por severidad
   - Recomendaciones

## Opciones

| Opcion | Descripcion |
|--------|-------------|
| (ninguna) | Revisar todos los cambios |
| `--staged` | Solo cambios en staging |
| `<archivo>` | Revisar archivo especifico |
| `--fix` | Sugerir fixes automaticos |

## Ejemplo de Uso

```
/quality/review
/quality/review --staged
/quality/review backend/adapter/inbound/api/routers/nominas_router.py
/quality/review --fix
```

## Integracion con Workflow

Este comando se usa tipicamente:

1. **Antes de commit**: Verificar que los cambios son correctos
2. **Antes de PR**: Asegurar calidad antes de solicitar review
3. **Despues de implementar feature**: Validar arquitectura

## Checklist Automatico

El review verifica:

### Backend
- [ ] Arquitectura hexagonal respetada
- [ ] DTOs correctamente definidos
- [ ] Use cases sin dependencias de infraestructura
- [ ] Repositories implementan ports
- [ ] Manejo de errores con ResponseDTO
- [ ] Sin SQL injection

### Frontend
- [ ] Feature-Sliced Design respetado
- [ ] Hooks usan TanStack Query correctamente
- [ ] Tipos definidos (no any)
- [ ] Componentes sin logica de negocio
- [ ] Query keys consistentes
- [ ] Invalidacion de cache en mutations
