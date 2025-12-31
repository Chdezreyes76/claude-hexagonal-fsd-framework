---
name: issue-complete-examples
description: 8 ejemplos completos y detallados de /workflow:issue-complete con outputs esperados, troubleshooting y patrones de fallo
---

# Issue Complete - 8 Ejemplos Detallados

Referencia completa de 8 casos de uso reales con outputs esperados, timing, y soluciones para problemas comunes.

## 📋 Tabla de Contenidos

1. **Ejemplo 1**: Modo Normal (control manual)
2. **Ejemplo 2**: Modo Bucle Automático (3 issues)
3. **Ejemplo 3**: Detener Bucle Manualmente
4. **Ejemplo 4**: Proyecto Específico (filtro de proyecto)
5. **Ejemplo 5**: Auto-Corrección (Fase 4)
6. **Ejemplo 6**: Auto-Resolución de Conflictos (Fase 5)
7. **Ejemplo 7**: Persistencia de Sesión (Fase 6)
8. **Ejemplo 8**: Modo Autónomo Completo (--autonomous)

---

## Ejemplo 1: Modo Normal (con pregunta)

**Comando**: `/workflow:issue-complete`

**Caso**: Usuario quiere resolver UN issue con control total y decisiones manuales.

```
Usuario: /workflow:issue-complete

[PASO 1: Seleccionar Issue]
→ /github:next
→ Top 5 issues mostrados
  #184 [ALTA] Override button positioning
  #183 [MEDIA] Add dark mode toggle
  #182 [BAJA] Fix typo in README
  #181 [ALTA] Refactor UserCard component
  #180 [MEDIA] Add pagination

Usuario selecciona: #184

→ Rama creada: fix/184-override-button
→ Plan de implementación mostrado

[PASO 2: Implementación]
→ issue-planner análisis
→ Agente especializado: frontend-implementer
→ Cambios realizados:
  ✅ UserCard.tsx - Actualizar estilos
  ✅ useOverride.ts - Nuevo hook
  ✅ Test agregado
  ✅ 3 commits automáticos

Tiempo: ~3-4 minutos

[PASO 3: Pull Request]
→ /github:pr
→ PR #209 creado
→ Descripción: "fix: override button positioning in UserCard"
→ Branch: fix/184-override-button → main

[PASO 4: Code Review ⭐ CRÍTICO]
→ /quality:review
→ Validación ejecutada:
  ✅ TypeScript: Sin errores
  ✅ FSD: Cumple patrones
  ✅ Tests: Passing
  ✅ Convenciones: Commits OK
  ✅ Arquitectura: Válida

Resultado: ✅ APROBADO

[PASO 5: Merge]
→ /github:merge
→ PR #209 mergeado exitosamente
→ Branch eliminada: fix/184-override-button
→ Main actualizado

[PASO 6: Siguiente Issue?]
→ "¿Deseas resolver otro issue?"

Usuario: "no"

[Mostrar Resumen]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA

📊 Estadísticas:
  Issues completados: 1
  PRs creados: 1
  PRs mergeados: 1
  Code reviews: 1 (APROBADO)
  Tiempo total: ~8 minutos
  Calidad: 100%

📋 Issue Completado:
  #184 [ALTA] Override button positioning
  PR #209 ✅
  Merged
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: ~8 minutos
**Intervenciones humanas**: 2 (seleccionar issue + decidir si continuar)
**Indicado para**: Aprender el flujo, control total, issues simples

---

## Ejemplo 2: Modo Bucle Automático

**Comando**: `/workflow:issue-complete --loop --max=3`

**Caso**: Resolver 3 issues sin intervención entre ellos.

```
Usuario: /workflow:issue-complete --loop --max=3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SESIÓN INICIADA - Modo Bucle
  Máximo: 3 issues
  Auto-selección: ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ISSUE 1/3]
→ /github:next (automático)
→ Auto-selecciona #215 [ALTA] Implementar validación
→ Plan mostrado
→ frontend-implementer ejecuta cambios
→ 3 commits realizados
→ PR #227 creado
→ /quality:review: ✅ APROBADO
→ /github:merge: ✅ Mergeado
→ Duración: 4 minutos

✅ Issue #215 completado (1/3)

[ISSUE 2/3]
→ /github:next (automático)
→ Auto-selecciona #214 [MEDIA] Agregar filtros
→ Plan mostrado
→ backend-implementer ejecuta cambios
→ PR #226 creado
→ /quality:review: ✅ APROBADO
→ /github:merge: ✅ Mergeado
→ Duración: 3 minutos

✅ Issue #214 completado (2/3)

[ISSUE 3/3]
→ /github:next (automático)
→ Auto-selecciona #213 [BAJA] Fix typo
→ Plan mostrado
→ Agente ejecuta cambios
→ PR #225 creado
→ /quality:review: ✅ APROBADO
→ /github:merge: ✅ Mergeado
→ Duración: 2 minutos

✅ Issue #213 completado (3/3)

[Límite alcanzado]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA

📊 Estadísticas Finales:
  Issues procesados: 3/3 (100%)
  ├─ ✅ Completados: 3
  ├─ ⚠️ Saltados: 0
  └─ ❌ Abortados: 0

  PRs creados: 3
  PRs mergeados: 3
  Code reviews: 3 (100% APROBADOS)

  Tiempo total: ~9 minutos
  Tiempo promedio por issue: 3 minutos
  Calidad: 100%

📋 Issues Completados:
  1. ✅ #215 [ALTA] Validación → PR #227
  2. ✅ #214 [MEDIA] Filtros → PR #226
  3. ✅ #213 [BAJA] Typo → PR #225

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: ~9 minutos (3 minutos promedio/issue)
**Intervenciones humanas**: 0
**Indicado para**: Lotes de issues simples, sesiones cortas

---

## Ejemplo 3: Detener Bucle Manualmente

**Comando**: `/workflow:issue-complete --loop` (sin --max)

**Caso**: Usuario inicia bucle infinito pero lo detiene manualmente después de 2 issues.

```
Usuario: /workflow:issue-complete --loop

[ISSUE 1/∞]
→ Auto-selecciona #215 ✅
→ PR #227 creado y mergeado
→ Duración: 4 minutos

✅ Issue #215 completado

[ISSUE 2/∞]
→ Auto-selecciona #214 ✅
→ PR #226 creado
→ Code Review: APROBADO
→ Mergeado exitosamente
→ Duración: 3 minutos

✅ Issue #214 completado

→ "🔄 Continuando con siguiente issue..."
→ "Escribe 'detener' para salir"

Usuario: detener

[Bucle detenido]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN DETENIDA POR USUARIO

📊 Estadísticas:
  Issues completados: 2
  PRs mergeados: 2
  Tiempo total: ~7 minutos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: ~7 minutos
**Intervenciones humanas**: 1 (comando "detener")
**Indicado para**: Sesiones flexibles sin límite predefinido

---

## Ejemplo 4: Proyecto Específico

**Comando**: `/workflow:issue-complete --loop --max=3 --project=7`

**Caso**: Resolver solo issues del Proyecto #7 (iteración específica).

```
Usuario: /workflow:issue-complete --loop --max=3 --project=7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SESIÓN INICIADA - Proyecto #7
  Máximo: 3 issues
  Proyecto: "FSD Migration Q4"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Obteniendo issues del Proyecto #7...]
→ Encontrados 12 issues abiertos
→ Top 5 por prioridad:
  1. #236 [ALTA] Refactor UserListItem.tsx
  2. #235 [ALTA] Refactor EntityFormModal
  3. #234 [ALTA] Refactor UserCard.tsx
  4. #233 [MEDIA] Refactor UserAvatar.tsx
  5. #232 [MEDIA] Refactor estructura usuario/

[ISSUE 1/3 - Proyecto #7]
→ Auto-selecciona #236 (más prioritario)
→ Plan: "Refactor componente UserListItem"
→ frontend-implementer ejecuta
→ PR #230 creado
→ /quality:review: ✅ APROBADO
→ /github:merge: ✅ Mergeado
→ Duración: 5 minutos

✅ Issue #236 completado (1/3)

[ISSUE 2/3 - Proyecto #7]
→ Auto-selecciona #234 (siguiente prioritario)
→ Plan: "Refactor UserCard"
→ PR #231 creado
→ /quality:review: ✅ APROBADO
→ Merge exitoso
→ Duración: 4 minutos

✅ Issue #234 completado (2/3)

[ISSUE 3/3 - Proyecto #7]
→ Auto-selecciona #233
→ Plan: "Refactor UserAvatar"
→ PR #232 creado
→ Review: ✅ APROBADO
→ Mergeado
→ Duración: 3 minutos

✅ Issue #233 completado (3/3)

[Límite alcanzado]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA - Proyecto #7

📊 Estadísticas:
  Proyecto: #7 "FSD Migration Q4"
  Issues completados: 3/3
  Issues restantes: 9

  PRs mergeados: 3
  Code reviews: 3 (100% exitosas)
  Tiempo total: ~12 minutos

  Progreso del Proyecto: 25% (3 de 12 issues)

📋 Issues Completados:
  1. ✅ #236 [ALTA] Refactor UserListItem → PR #230
  2. ✅ #234 [ALTA] Refactor UserCard → PR #231
  3. ✅ #233 [MEDIA] Refactor UserAvatar → PR #232

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: ~12 minutos
**Intervenciones humanas**: 0
**Indicado para**: Épicos, iteraciones, proyectos específicos

---

## Ejemplo 5: Auto-Corrección (Fase 4)

**Comando**: `/workflow:issue-complete --loop --max=3 --autonomous`

**Caso**: Cuando code review rechaza, el sistema auto-corrige automáticamente (Fase 4).

```
Usuario: /workflow:issue-complete --loop --max=3 --autonomous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MODO AUTÓNOMO ACTIVADO
  - Auto-selección: ✅
  - Auto-corrección reviews: 2 ciclos
  - Auto-resolve conflictos: ✅
  - Circuit breaker: 3 fallos
  - Persistencia sesión: ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ISSUE 1/3]
→ Auto-selecciona #150 [ALTA] Validación usuarios
→ backend-implementer ejecuta
→ PR #240 creado
→ /quality:review ejecutándose...

📊 CODE REVIEW RESULT:
   Status: ❌ REJECTED
   Critical Issues: 2

   ❌ Problemas encontrados:
   1. CrearUsuarioUseCase accede directamente a UsuarioRepository
      → Debe inyectar UsuarioRepositoryPort
   2. Falta validación de email duplicado

🔄 AUTO-CORRECCIÓN: Ciclo 1/2
   Reintentando con feedback...

   → Cambiando Repository por RepositoryPort
   → Agregando validación de email
   → Commit: "fix: use port instead of repository, add email validation"
   → Push: fix/150-validacion-usuarios
   → Re-ejecutando code review...

📊 CODE REVIEW RESULT (2do intento):
   Status: ✅ APPROVED_WITH_WARNINGS

   ⚠️ Warnings (no críticos):
   - Query key hardcoded en línea 15

   → Sin issues críticos, procede a merge

✅ AUTO-CORRECCIÓN EXITOSA en ciclo 1
→ /github:merge: ✅ Mergeado
→ Duración: 7 minutos (incluye auto-corrección)

✅ Issue #150 completado (1/3) - Auto-corregido

[ISSUE 2/3]
→ Auto-selecciona #151 [MEDIA] Refactor auth hook
→ frontend-implementer ejecuta
→ PR #241 creado
→ /quality:review: ✅ APROBADO (primer intento)
→ Mergeado exitosamente
→ Duración: 3 minutos

✅ Issue #151 completado (2/3)

[ISSUE 3/3]
→ Auto-selecciona #152 [ALTA] Add user permissions
→ fullstack-implementer ejecuta
→ PR #242 creado
→ Code Review: ❌ REJECTED (3 críticos)

🔄 AUTO-CORRECCIÓN: Ciclo 1/2
   → Corrigiendo...
   → Review: ❌ REJECTED (2 críticos persisten)

🔄 AUTO-CORRECCIÓN: Ciclo 2/2
   → Corrigiendo...
   → Review: ❌ REJECTED (1 crítico persiste)

❌ AGOTADOS CICLOS DE CORRECCIÓN
   Máximo: 2 ciclos
   Última falla: "Falta validación de permisos en dominio"

⚠️ Saltando issue #152
   Razón: Code review rechazado después de 2 ciclos
   Acción: Requiere atención manual

[Mostrar Resumen Final]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA

📊 ESTADÍSTICAS FINALES:
  Issues procesados: 3/3 (100%)
  ├─ ✅ Completados: 2 (67%)
  ├─ ⚠️ Saltados: 1 (33%)
  └─ ❌ Abortados: 0 (0%)

  PRs creados: 3
  PRs mergeados: 2

  🔄 AUTO-CORRECCIÓN (Fase 4):
    Ciclos ejecutados: 3 total
    ├─ Exitosos (ciclo 1): 1 issue
    └─ Fallidos (ciclo 2): 1 issue

  Code reviews: 5 (incluyendo re-reviews)
  ├─ Aprobados 1er intento: 1 issue
  ├─ Auto-corregidos exitosos: 1 issue
  └─ No resolubles: 1 issue

  Tiempo total: ~13 minutos
  Ahorro por auto-corrección: ~5 minutos

📋 ISSUES COMPLETADOS:
  1. ✅ #150 [ALTA] Validación usuarios → PR #240 ✅
     Auto-corregido en 1 ciclo (7 min total)
  2. ✅ #151 [MEDIA] Refactor auth hook → PR #241 ✅

⚠️ ISSUES SALTADOS (atención manual requerida):
  1. #152 [ALTA] Add user permissions
     Razón: Review rechazado después de 2 ciclos
     Feedback: "Falta validación de permisos en capa de dominio"
     PR: #242 (abierto)

     Acción recomendada:
     - Revisar feedback del code review
     - Implementar validación de permisos
     - Re-ejecutar: /workflow:issue-complete (con issue #152)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: ~13 minutos
**Auto-correcciones exitosas**: 1/1 (100%)
**Intervenciones humanas**: 0
**Indicado para**: Issues con pequeños problemas de review, mayor autonomía

---

## Ejemplo 6: Auto-Resolución de Conflictos (Fase 5)

**Comando**: `/workflow:issue-complete --loop --max=4 --autonomous --auto-resolve-conflicts`

**Caso**: Conflictos de merge se resuelven automáticamente usando 3 estrategias progresivas.

```
Usuario: /workflow:issue-complete --loop --max=4 --autonomous --auto-resolve-conflicts

[ISSUE 1/4]
→ Auto-selecciona #160 [ALTA] Update user model
→ fullstack-implementer ejecuta
→ PR #250 creado
→ Code Review: ✅ APROBADO
→ Merge exitoso (sin conflictos)
→ Duración: 4 minutos

✅ Issue #160 completado (1/4)

[ISSUE 2/4]
→ Auto-selecciona #161 [MEDIA] Add pagination
→ PR #251 creado
→ Code Review: ✅ APROBADO

→ /github:merge ejecutándose...

⚠️ CONFLICTOS DETECTADOS EN PR #251
   Estado mergeable: CONFLICTING

🔧 ESTRATEGIA 1: Rebase Automático
   → git rebase origin/master
   → ✅ Rebase completado sin conflictos
   → git push --force-with-lease
   → ✅ PR ahora es mergeable

✅ REBASE EXITOSO - Conflictos resueltos
→ /github:merge: ✅ PR #251 mergeado
→ Duración: 5 minutos (incluye rebase)

✅ Issue #161 completado (2/4) - Conflictos resueltos

[ISSUE 3/4]
→ Auto-selecciona #162 [ALTA] Update dependencies
→ PR #252 creado
→ Code Review: ✅ APROBADO

→ /github:merge ejecutándose...

⚠️ CONFLICTOS DETECTADOS EN PR #252
   Archivos con conflictos:
   - package.json
   - package-lock.json
   - backend/requirements.txt

🔧 ESTRATEGIA 1: Rebase
   → git rebase origin/master
   → ❌ Rebase falló (conflictos complejos)

🔧 ESTRATEGIA 2: Merge con estrategia 'ours'
   → git merge origin/master -X ours
   → ❌ Merge falló

🔧 ESTRATEGIA 3: Análisis Selectivo
   → Detectados conflictos SOLO en archivos de config
   → Usando versión de master para dependencias

   ✓ Resuelto package.json
   ✓ Resuelto package-lock.json
   ✓ Resuelto requirements.txt

   → git commit -m "chore: auto-resolve dependency conflicts"
   → git push

✅ RESOLUCIÓN SELECTIVA EXITOSA - PR mergeable
→ /github:merge: ✅ PR #252 mergeado
→ Duración: 6 minutos

✅ Issue #162 completado (3/4) - Dependencias resueltas

[ISSUE 4/4]
→ Auto-selecciona #163 [ALTA] Refactor user service
→ PR #253 creado
→ Code Review: ✅ APROBADO

→ /github:merge ejecutándose...

⚠️ CONFLICTOS DETECTADOS EN PR #253
   Archivos con conflictos:
   - backend/application/use_cases/usuario/crear_usuario_use_case.py
   - backend/domain/entities/usuario.py
   - frontend/src/features/usuarios/services/usuarioService.ts

🔧 ESTRATEGIA 1: Rebase
   → ❌ Rebase falló

🔧 ESTRATEGIA 2: Merge
   → ❌ Merge falló

🔧 ESTRATEGIA 3: Análisis Selectivo
   ⚠️ Conflictos en código fuente detectados
   ⚠️ No es seguro resolver automáticamente
   ⚠️ Requiere revisión manual

❌ NO RESOLUBLES AUTOMÁTICAMENTE
   Tipo: Conflictos en código fuente
   Opción 1: Resolver manualmente
   Opción 2: Saltar (modo autónomo)

⚠️ Saltando issue #163 (Modo autónomo)
   PR #253 permanece abierto para resolución manual

[Mostrar Resumen Final]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA

📊 ESTADÍSTICAS FINALES:
  Issues procesados: 4/4 (100%)
  ├─ ✅ Completados: 3 (75%)
  ├─ ⚠️ Saltados: 1 (25%)
  └─ ❌ Abortados: 0 (0%)

  PRs creados: 4
  PRs mergeados: 3

  🔄 AUTO-RESOLUCIÓN DE CONFLICTOS (Fase 5):
    Conflictos detectados: 3
    ├─ ✅ Rebase exitoso: 1 issue
    ├─ ✅ Resolución selectiva: 1 issue
    └─ ⚠️ Código fuente (manual): 1 issue

    Tasa de éxito: 67% (2 de 3)
    Tasa en dependencies: 100% (2 de 2)

  Estrategias utilizadas:
  ├─ Rebase: 1 éxito (PR #251)
  ├─ Merge 'ours': 0 éxitos
  └─ Selectiva: 1 éxito (PR #252)

  Tiempo total: ~15 minutos
  Ahorro por auto-resolución: ~10 minutos

📋 ISSUES COMPLETADOS:
  1. ✅ #160 [ALTA] Update user model → PR #250 ✅
  2. ✅ #161 [MEDIA] Add pagination → PR #251 ✅
     (Conflictos: rebase automático)
  3. ✅ #162 [ALTA] Update dependencies → PR #252 ✅
     (Conflictos: resolución selectiva de dependencias)

⚠️ ISSUES SALTADOS:
  1. #163 [ALTA] Refactor user service
     PR: #253 (abierto)
     Razón: Conflictos en código fuente
     Archivos: 3 (use_cases, entities, services)

     Acción: Resolver manualmente o ejecutar:
     /workflow:issue-complete (con issue #163)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: ~15 minutos
**Conflictos resueltos automáticamente**: 2/3 (67%)
**Conflictos en dependencies**: 2/2 (100%)
**Intervenciones humanas**: 0
**Indicado para**: Sesiones con cambios paralelos, actualizaciones de dependencias

---

## Ejemplo 7: Persistencia de Sesión (Fase 6)

**Comando**: `/workflow:issue-complete --loop --max=10 --autonomous --timeout-per-issue=8 --max-consecutive-failures=2 --save-session`

**Caso**: Sesión larga con timeouts y circuit breaker. Pausa y reanudación.

```
Usuario: /workflow:issue-complete --loop --max=10 --autonomous --timeout-per-issue=8 --max-consecutive-failures=2 --save-session

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NUEVA SESIÓN INICIADA

Configuración:
  Máximo: 10 issues
  Timeout por issue: 8 minutos
  Circuit breaker: 2 fallos consecutivos
  Persistencia: ✅ ACTIVADA
  Archivo: .claude/session/workflow-session.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ISSUE 1/10]
→ Auto-selecciona #170 [ALTA] Optimize queries
→ Inicio: 14:00:00
→ backend-implementer ejecuta
→ PR #260 creado
→ Review: ✅ APROBADO
→ Merge: ✅ Exitoso
→ Duración: 5 minutos

✅ Issue #170 completado (1/10)
💾 Sesión guardada

[ISSUE 2/10]
→ Auto-selecciona #171 [ALTA] Add notifications
→ Inicio: 14:05:30
→ Implementación compleja...
→ Tiempo: 6 min... 7 min... 8 min...

⏱️ TIMEOUT EXCEDIDO
   Issue #171 tardó más de 8 minutos

⚠️ Saltando issue
   Fallos consecutivos: 1/2

💾 Sesión guardada

[ISSUE 3/10]
→ Auto-selecciona #172 [MEDIA] Update profile
→ Inicio: 14:14:00
→ PR #261 creado
→ Review: ❌ REJECTED

🔄 Auto-Corrección ciclo 1/2
   → Corrigiendo...
   → Review: ❌ REJECTED

🔄 Auto-Corrección ciclo 2/2
   → Corrigiendo...
   → Review: ❌ REJECTED

❌ Agotados ciclos de corrección
   Fallos consecutivos: 2/2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CIRCUIT BREAKER ACTIVADO

❌ 2 fallos consecutivos detectados
   Máximo permitido: 2

⚠️ Deteniendo workflow para prevenir loops

📊 Estado actual:
   Issues completados: 1/10
   Issues saltados: 2
   Últimos 2 issues fallaron consecutivamente

💡 Causas posibles:
   - Issues demasiado complejos
   - Problemas con servicios externos
   - Errores de configuración

🔧 Acciones recomendadas:
   1. Revisar issues #171 y #172
   2. Verificar configuración del proyecto
   3. Ajustar --timeout-per-issue (aumentar)
   4. Reanudar después de 10-15 minutos

💾 Sesión guardada en:
   .claude/session/workflow-session.json

   Para reanudar:
   /workflow:issue-complete --resume=.claude/session/workflow-session.json --timeout-per-issue=12

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PRIMERA SESIÓN - Reporte
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duración: 14 minutos
Issues: 3/10 (30%)
  ├─ Completados: 1 (33%)
  ├─ Saltados: 2 (67%)
  └─ Pendientes: 7 (70%)

Problemas encontrados:
  ├─ 1 timeout (issue #171 - 8 min)
  └─ 1 review rechazado (issue #172)

Circuit breaker activado
Sesión guardada y pausada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

=== 2 HORAS DESPUÉS ===

Usuario: /workflow:issue-complete --resume=.claude/session/workflow-session.json --timeout-per-issue=12

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 REANUDANDO SESIÓN

📂 Archivo: .claude/session/workflow-session.json
✅ Sesión cargada exitosamente

Estado guardado:
  Iniciada: 2025-12-22 14:00:00
  Issues completados: 1
  Issues saltados: 2
  Issues pendientes: 7
  Progreso: 1/10 (10%)

⏭️ Continuando desde donde se quedó...

[Configuración actualizada]
  Timeout anterior: 8 minutos
  Timeout nuevo: 12 minutos ✅
  Circuit breaker: Reset (0/2 fallos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ISSUE 4/10]
→ Auto-selecciona #173 [MEDIA] Export functionality
→ PR #262 creado
→ Review: ✅ APROBADO
→ Merge: ✅ Exitoso
→ Duración: 4 minutos

✅ Issue #173 completado (2/10 total)
💾 Sesión actualizada

[ISSUE 5/10]
→ Auto-selecciona #171 (reintento) [ALTA] Notifications
→ Con timeout de 12 min (antes fue 8)
→ Implementación compleja...
→ Duración: 11 minutos (dentro del límite)
→ PR #263 creado
→ Review: ✅ APROBADO
→ Merge: ✅ Exitoso

✅ Issue #171 completado exitosamente (3/10 total)
   Nota: Requería 11 min (timeout original 8 min era insuficiente)
💾 Sesión actualizada

[ISSUE 6-10]
→ Continúa automáticamente...
→ Todos completados exitosamente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA EXITOSAMENTE

📊 ESTADÍSTICAS FINALES (Ambas sesiones):

Duración total: 3h 25 min
  ├─ Sesión 1: 14 minutos
  ├─ Pausa: 2 horas
  └─ Sesión 2: 1h 11 minutos

Issues procesados: 10/10 (100%)
  ├─ ✅ Completados: 10
  ├─ ⚠️ Saltados: 0
  └─ ❌ Abortados: 0

PRs creados: 10
PRs mergeados: 10

⏱️ TIMEOUTS & CIRCUIT BREAKER:

Sesión 1:
  ├─ Timeouts: 1 (#171 con 8 min limit)
  ├─ Circuit breaker: Activado (2/2 fallos)
  └─ Issues saltados: 2

Sesión 2:
  ├─ Timeouts: 0 (con 12 min limit)
  ├─ Circuit breaker: Nunca activado
  └─ Issues completados: Todos

💡 LECCIONES APRENDIDAS:

1. Issue #171 requería 11 minutos
   → Timeout de 8 min era insuficiente
   → Aumentar a 12 min resolvió el problema

2. Circuit breaker funcionó perfectamente
   → Previno fallos cascada
   → Permitió reanudar sin pérdida de contexto

3. Persistencia de sesión crítica
   → Guardó 1 hora de progreso
   → Permitió ajustar parámetros en reanudación

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: 3h 25 min (incluyendo pausa de 2h)
**Sesiones**: 2 (con reanudación)
**Issues completados**: 10/10 (100%)
**Circuit breaker**: 1 activación (previno problemas)
**Intervenciones humanas**: 2 (inicial + reanudación con parámetro ajustado)
**Indicado para**: Sesiones largas, proyectos grandes, ajuste dinámico de parámetros

---

## Ejemplo 8: Modo Autónomo Completo

**Comando**: `/workflow:issue-complete --loop --max=5 --project=7 --autonomous`

**Caso**: CERO intervenciones. Incluye auto-selección, auto-corrección, auto-resolución, epic breakdown y persistencia.

```
Usuario: /workflow:issue-complete --loop --max=5 --project=7 --autonomous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MODO AUTÓNOMO ACTIVADO

Características habilitadas automáticamente:
  ├─ Auto-selección: ✅
  ├─ Auto-corrección reviews: 2 ciclos
  ├─ Auto-resolución conflictos: ✅
  ├─ Epic breakdown: ✅ (si issue demasiado complejo)
  ├─ Persistencia sesión: ✅
  ├─ Timeout por issue: 10 minutos
  └─ Circuit breaker: 3 fallos consecutivos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Nueva sesión iniciada
   Máximo: 5 issues
   Proyecto: #7 "Architecture Refactor"
   Guardando: .claude/session/workflow-session.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ISSUE 1/5]
→ Auto-selecciona #180 [ALTA] Refactor authentication
→ Plan: Separar use cases de dominio
→ fullstack-implementer ejecuta
→ PR #270 creado
→ Review: ✅ APROBADO
→ Merge: ✅ Exitoso
→ Duración: 4 minutos

✅ Issue #180 completado (1/5)
💾 Sesión guardada

[ISSUE 2/5]
→ Auto-selecciona #181 [MEDIA] Add export feature
→ PR #271 creado
→ Review: ❌ REJECTED
   "Falta validación de tipos en export"

🔄 AUTO-CORRECCIÓN: Ciclo 1/2
   → Agregando validación de tipos
   → Commit: "fix: add type validation to export"
   → Re-ejecutando review...
   → Review: ✅ APROBADO ✅

✅ Issue #181 completado (2/5) - Auto-corregido en ciclo 1
💾 Sesión guardada

[ISSUE 3/5]
→ Auto-selecciona #182 [ALTA] Update dependencies
→ PR #272 creado
→ Review: ✅ APROBADO

→ /github:merge ejecutándose...

⚠️ CONFLICTOS DETECTADOS
   Archivos: package.json, requirements.txt

🔧 ESTRATEGIA 3: Resolución selectiva
   ✓ Resuelto package.json (theirs)
   ✓ Resuelto requirements.txt (theirs)

✅ Conflictos resueltos automáticamente
→ Merge: ✅ Exitoso

✅ Issue #182 completado (3/5) - Conflictos auto-resueltos
💾 Sesión guardada

[ISSUE 4/5]
→ Auto-selecciona #183 [ALTA] Notification system (COMPLEJO)
→ Plan: Multi-módulo, email+push, frontend+backend
→ Implementación: Intento 1 - ❌ FALLO
→ Implementación: Intento 2 - ❌ FALLO
→ Implementación: Intento 3 - ❌ FALLO

❌ Issue #183 DEMASIADO COMPLEJO
   3 intentos de implementación fallaron

🎯 EPIC BREAKDOWN ACTIVADO (--autonomous)
   Analizando issue #183...

   ✅ Epic creado exitosamente:
      Número: #183 (convertido a Epic)
      Proyecto: #12 "Notification System Epic"
      Sub-issues creados: 8

      1. #184 [backend] Create notification model
      2. #185 [backend] Add notification endpoints
      3. #186 [backend] Implement email service
      4. #187 [backend] Add push notification service
      5. #188 [frontend] Create notification UI
      6. #189 [frontend] Add notification hooks
      7. #190 [frontend] Implement notification center
      8. #191 [fullstack] Integration tests

💡 EPIC BREAKDOWN INFO:
   Issue original #183 dividido en 8 sub-issues
   Cada sub-issue es independiente y manejable (~30 min)

   Para resolver el Epic:
   /workflow:issue-complete --loop --project=12 --autonomous

→ Continuando con siguiente issue del loop principal...
💾 Sesión guardada

[ISSUE 5/5]
→ Auto-selecciona #192 [MEDIA] Fix user profile bug
→ frontend-implementer ejecuta
→ PR #273 creado
→ Review: ✅ APROBADO
→ Merge: ✅ Exitoso
→ Duración: 3 minutos

✅ Issue #192 completado (4/5)
💾 Sesión guardada

[Mostrar Resumen Final]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SESIÓN COMPLETADA EXITOSAMENTE

Duración total: 28 minutos

📊 ESTADÍSTICAS FINALES:

  Issues procesados: 5/5 (100%)
  ├─ ✅ Completados: 4 (80%)
  ├─ 🎯 Epic creados: 1 (20%)
  ├─ ⚠️ Saltados: 0
  └─ ❌ Abortados: 0

  PRs creados: 4
  PRs mergeados: 4

🤖 CARACTERÍSTICAS AUTÓNOMAS USADAS:

  Auto-selección:
    ├─ 5/5 issues (100%)
    └─ Todos de proyecto #7 por prioridad

  Auto-corrección (Fase 4):
    ├─ Reviews ejecutados: 5
    ├─ Rechazos encontrados: 1
    ├─ Auto-corregidos: 1 (100% de rechazos)
    └─ Ciclos promedio: 1

  Auto-resolución conflictos (Fase 5):
    ├─ Conflictos encontrados: 1
    ├─ Resueltos automáticamente: 1 (100%)
    └─ Estrategia usada: Resolución selectiva

  Epic breakdown (Fase 2):
    ├─ Issues complejos detectados: 1
    ├─ Epics creados: 1
    ├─ Sub-issues creados: 8
    └─ Complejidad: Issue #183 → 8 tareas manejables

  Persistencia sesión (Fase 6):
    ├─ Auto-saves: 5
    └─ Archivo: .claude/session/workflow-session.json

  Timeouts: 0 (todos < 10 min)
  Circuit breaker: No activado (0/3 fallos)

📋 ISSUES COMPLETADOS:
  1. ✅ #180 [ALTA] Refactor authentication → PR #270 ✅
     Duración: 4 min

  2. ✅ #181 [MEDIA] Add export feature → PR #271 ✅
     Duración: 4 min (incluye auto-corrección)
     Auto-corregido en ciclo 1

  3. ✅ #182 [ALTA] Update dependencies → PR #272 ✅
     Duración: 4 min
     Conflictos: Auto-resueltos

  4. ✅ #192 [MEDIA] Fix user profile bug → PR #273 ✅
     Duración: 3 min

🎯 EPICS CREADOS:
  1. Epic #183 → Proyecto #12 "Notification System"
     Sub-issues: 8
     Complejidad: ALTA

     Para resolver:
     /workflow:issue-complete --loop --project=12 --autonomous

     Estimado: ~5 horas para resolver todas sub-issues

📈 EFECTIVIDAD MODO AUTÓNOMO:

  Auto-selección: 100% exitosas (5/5)
  Auto-corrección: 100% exitosas (1/1)
  Auto-conflictos: 100% exitosas (1/1)
  Epic breakdown: 1 issue complejo dividido en 8

  Intervenciones manuales: 0
  Decisiones humanas requeridas: 0

  Timeouts: 0
  Fallos persistentes: 0
  Circuit breaker activado: NO

  Tiempo total: 28 minutos
  Tiempo promedio por issue: 7 minutos
  Issues por hora: ~8.5 issues/hora

💡 DESTACADO DEL MODO --autonomous:

  ✅ CERO intervención manual requerida
  ✅ Issue complejo automáticamente convertido a Epic
  ✅ Auto-corrección funcionó perfectamente
  ✅ Conflictos de dependencias resueltos automáticamente
  ✅ Sesión persistida para continuación
  ✅ Ningún issue perdido (Epic → 8 sub-issues manejables)
  ✅ 100% de issues procesados (4 completados + 1 Epic)

🚀 PRÓXIMOS PASOS SUGERIDOS:

  1. Resolver el Epic creado:
     /workflow:issue-complete --loop --project=12 --autonomous

  2. Continuar con proyecto #7:
     /workflow:issue-complete --loop --max=10 --project=7 --autonomous

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Timing**: 28 minutos
**Intervenciones humanas**: 0
**Auto-correcciones**: 1/1 (100%)
**Auto-conflictos resueltos**: 1/1 (100%)
**Epics creados**: 1 (issue complejo dividido en 8 sub-issues)
**Issues completados**: 4/5 (80%) + 1 Epic
**Indicado para**: Máxima autonomía, sesiones sin supervisión, proyectos grandes

---

## 🆘 Troubleshooting Común

### Problema: Issue toma más tiempo del esperado

**Síntoma**: Issue #150 tardó 15 minutos (timeout por defecto: 10 min)

**Soluciones**:
1. Aumentar timeout: `--timeout-per-issue=20`
2. Dividir issue en sub-issues más pequeños
3. Usar `--autonomous` para auto-corregir mientras espera

### Problema: Code review rechaza repetidamente

**Síntoma**: Issue #152 rechazado 3 veces, saltado después de 2 ciclos

**Soluciones**:
1. Revisar feedback del review cuidadosamente
2. Aumentar ciclos: `--auto-fix-reviews=5`
3. Ejecutar issue manualmente sin auto-modo
4. Dividir issue si es demasiado complejo

### Problema: Conflictos no resolubles automáticamente

**Síntoma**: PR #253 tiene conflictos en código fuente, no se puede auto-resolver

**Soluciones**:
1. Resolver conflictos manualmente
2. Rebase manual antes de merge
3. Usar `--auto-resolve-conflicts` con mayor cautela
4. Verificar que master está actualizado

### Problema: Circuit breaker se activa

**Síntoma**: Sesión pausada después de 3 fallos consecutivos

**Soluciones**:
1. Revisar últimos 3 issues que fallaron
2. Verificar configuración del proyecto
3. Aumentar `--max-consecutive-failures=5`
4. Ajustar `--timeout-per-issue` o `--auto-fix-reviews`

---

## 📊 Comparativa: Tiempos y Resultados

| Modo | Issues | Tiempo | Intervenciones | Tasa Éxito |
|------|--------|--------|-----------------|-----------|
| Normal | 1 | 8 min | 2 | 100% |
| Bucle | 3 | 9 min | 0 | 100% |
| Proyecto | 3 | 12 min | 0 | 100% |
| Auto-Corrección | 3 | 13 min | 0 | 67% |
| Auto-Conflictos | 4 | 15 min | 0 | 75% |
| Persistencia | 10 | 3.5 h | 2 | 100% |
| Autónomo | 5 | 28 min | 0 | 100% |

---

## 🔗 Ver También

- `/workflow:issue-complete` - Comando principal
- `issue-complete-advanced` - Parámetros avanzados y Fases 4-6
- `issue-complete-reference` - Referencia técnica y diagramas
