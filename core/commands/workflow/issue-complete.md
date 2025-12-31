---
description: Orquesta el flujo completo de un issue - seleccionar, implementar, review, mergear, siguiente (con modo bucle)
allowed-tools: Skill, AskUserQuestion, Bash(git:*), Bash(gh:*), Task
argument-hint: |
  Parámetros para controlar el workflow:

  MODO DE OPERACIÓN:
    - (vacío) - Ejecuta un issue y pregunta si continuar (Modo Normal)
    - --loop - Ejecuta issues en bucle continuo (Modo Bucle)
    - --autonomous - Alias inteligente: auto-selecciona, auto-fix, auto-merge (⭐ RECOMENDADO)

  LIMITADORES:
    - --max=N - Máximo de issues a procesar
    - --project=N - Solo issues del proyecto #N
    - --label=NOMBRE - Solo issues con la label NOMBRE

  EJEMPLOS RÁPIDOS:
    /workflow:issue-complete                          # Modo normal
    /workflow:issue-complete --loop --max=5           # 5 issues
    /workflow:issue-complete --loop --project=7       # Proyecto #7
    /workflow:issue-complete --loop --autonomous      # Autónomo (RECOMENDADO)

  📖 VER TAMBIÉN:
    - Parámetros avanzados: skill issue-complete-advanced
    - 8 Ejemplos completos: skill issue-complete-examples
    - Referencia técnica: skill issue-complete-reference
---

# Workflow: Issue Complete

Automatiza el flujo completo de 7 pasos para resolver issues con máxima consistencia y calidad.

## 🎯 3 Modos de Ejecución

### Modo Normal: Control Manual
```
/workflow:issue-complete
```
Ejecuta un issue y pregunta si continuar. Ideal para aprender y control total.

### Modo Bucle: Múltiples Issues
```
/workflow:issue-complete --loop
/workflow:issue-complete --loop --max=5        # Máximo 5 issues
/workflow:issue-complete --loop --project=7    # Solo proyecto #7
```
Ejecuta múltiples issues sin intervención entre ellos.

### Modo Autónomo ⭐ (Recomendado)
```
/workflow:issue-complete --loop --max=20 --autonomous
```
Sin intervención humana: auto-selecciona, auto-implementa, auto-revisa, auto-mergea.

**El flag `--autonomous` activa**:
- ✅ Auto-selección de issues por prioridad
- ✅ Auto-corrección de code review (máx 2 ciclos)
- ✅ Auto-resolución de conflictos de merge
- ✅ Persistencia de sesión (guarda progreso)
- ✅ Circuit breaker (para tras 3 fallos)
- ✅ Timeout protection (10 min por issue)

## 🔄 Flujo Core de 7 Pasos

```
1. /github:next           ← Selecciona issue más prioritario
2. /github:start          ← Crea rama e inicia trabajo
3. issue-planner          ← Obtiene plan de implementación
4. [Implementación]       ← Agente especializado ejecuta cambios
5. /github:pr             ← Crea Pull Request
6. /quality:review        ← Code Review ⚠️ CRÍTICO (NUNCA se salta)
7. /github:merge          ← Mergea PR a master
   ↻ Siguiente issue (si --loop está activo)
```

**El flujo es resiliente**:
- Selección falla → pregunta al usuario
- Implementación falla → reintenta (máx 3 veces)
- Review rechaza → auto-corrige (máx 2 ciclos con --autonomous)
- Merge falla → intenta resolver conflictos
- Todo falla → salta issue y continúa

## 📊 Parámetros Disponibles

### Parámetros Básicos
| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `--loop` | Ejecuta múltiples en bucle | `--loop --max=5` |
| `--max=N` | Máximo de issues | `--max=10` |
| `--project=N` | Solo proyecto GitHub #N | `--project=7` |
| `--label=NOMBRE` | Solo con esa label | `--label=bug` |
| `--autonomous` | Modo totalmente autónomo | `--autonomous` |

### Parámetros Avanzados
Para timeouts, session persistence, circuit breaker, y más:
→ **Skill** `issue-complete-advanced`

## ⚠️ Puntos CRÍTICOS

### 1. Code Review NUNCA se Salta
El flujo **SIEMPRE ejecuta** Skill `quality:review`:
- Valida arquitectura, tests, convenciones
- Si APRUEBA → continúa a merge
- Si RECHAZA → con --autonomous: auto-corrige (máx 2 ciclos)
- Si sigue rechazando → salta issue

### 2. Reintentos Automáticos (con --autonomous)
- Implementación: máx 3 intentos
- Code review: máx 2 ciclos de corrección
- Merge: intenta resolver conflictos automáticamente
- Circuit breaker: para tras 3 fallos consecutivos

### 3. Manejo de Errores
```
Selección → ERROR → Pregunta al usuario
Implementación → ERROR → Reintenta (3 veces)
Review → ERROR → Auto-corrige (2 ciclos)
Merge → ERROR → Resuelve conflictos
Todo → SIGUE FALLANDO → Salta issue y continúa
```

## 🚀 Casos de Uso Comunes

### Caso 1: Resolver UN Issue Manualmente
```bash
/workflow:issue-complete
```
- Selecciona un issue
- Muestra plan
- Implementa
- Review
- Si aprueba → Pregunta si continuar
- Usuario decide

**Tiempo**: ~5-10 minutos por issue

### Caso 2: Sesión de 5 Issues
```bash
/workflow:issue-complete --loop --max=5
```
- Auto-selecciona 5 issues por prioridad
- Los resuelve uno tras otro
- Pregunta solo en decisiones críticas
- Guarda progreso

**Tiempo**: ~30-50 minutos (5 issues)

### Caso 3: Resolver Todos los BUGS
```bash
/workflow:issue-complete --loop --label=bug
```
- Filtra solo issues con label "bug"
- Los resuelve en orden de prioridad
- Continúa hasta que no haya más

**Tiempo**: Depende de cantidad de bugs

### Caso 4: Proyecto Específico
```bash
/workflow:issue-complete --loop --project=7
```
- Solo resuelve issues del proyecto #7
- Auto-selecciona por prioridad del proyecto
- Útil para épicos o iteraciones específicas

**Tiempo**: Variable (depends on project size)

### Caso 5: Sesión Totalmente Autónoma (SIN INTERVENCIÓN)
```bash
/workflow:issue-complete --loop --max=50 --autonomous
```
- **Sin intervención humana** - deja ejecutar y vuelve después
- Auto-selecciona hasta 50 issues
- Auto-implementa cada uno
- Auto-corrige si review rechaza
- Auto-mergea
- Guarda sesión cada 10 minutos
- Timeout: 10 minutos por issue
- Para tras 3 fallos consecutivos

**Tiempo**: ~2-3 horas para 50 issues con --autonomous

**Salida esperada**:
```
✅ 45 issues completados
🔄 3 convertidos a Epic (demasiado complejos)
⚠️ 2 skipped (fallos recurrentes)
─────────────────────────
Sesión guardada en: .claude/session/workflow-session.json
Puedes reanudar con: /workflow:issue-complete --resume=...
```

## 📋 Ejemplos Quick

### Ejemplo 1: Modo Normal (Detallado en skill examples)
```
usuario: /workflow:issue-complete
→ Selecciona #42
→ Plan mostrado
→ Implementa
→ PR creado
→ Review: ✅ APPROVED
→ Mergeado
→ ¿Siguiente? NO
───────────────────
1 issue resuelto
```

### Ejemplo 2: Bucle 3 Issues (Detallado en skill examples)
```
usuario: /workflow:issue-complete --loop --max=3
→ #215: Implementa → ✅ Merge
→ #214: Implementa → ✅ Merge
→ #213: Implementa → ✅ Merge
Límite alcanzado
───────────────────
3 issues resueltos
```

### Ejemplo 3: Autónomo 20 Issues (Detallado en skill examples)
```
usuario: /workflow:issue-complete --loop --max=20 --autonomous
⚡ AUTÓNOMO ACTIVADO
→ #236: ✅ 45s
→ #235: ✅ 52s
→ #234: ❌ Review rechaza → Auto-corrige → ✅ 2m15s
→ ... [issues 4-20 continúan]
───────────────────
18 completados, 2 Epic
```

**Para ejemplos COMPLETOS y DETALLADOS**, ver skill `issue-complete-examples`

## 🔗 Documentación Relacionada

Para explorar más:

- **Parámetros Avanzados**: Skill `issue-complete-advanced`
  - Session persistence y timeouts
  - Circuit breaker y reintentos
  - Configuración JSON

- **8 Ejemplos Completos**: Skill `issue-complete-examples`
  - Cada caso con output esperado
  - Troubleshooting común
  - Patrones de fallo y recuperación

- **Referencia Técnica**: Skill `issue-complete-reference`
  - Variables de sesión
  - Estados de error
  - Diagrama de flujo
  - Configuración disponible

- **Guía Individual**: Comando `/github:start`
  - Cómo trabajar en UN issue manualmente

## 📌 Resumen

✅ **Resolver issues automáticamente** desde selección hasta merge
✅ **3 modos** para diferentes necesidades (manual, bucle, autónomo)
✅ **Resiliente** con reintentos automáticos y manejo de errores
✅ **Escalable** desde 1 issue a 50+ por sesión
✅ **Code review obligatorio** - nunca se salta
✅ **Modular** - cada paso puede ejecutarse independientemente

## 🆘 Si Algo Falla

1. **Revisa el error específico** que Claude Code mostró
2. **Intenta modo normal** sin --loop (más control)
3. **Consulta skill reference**: `issue-complete-reference`
4. **Reporta con**: parámetros usados + número de issue + error exacto
