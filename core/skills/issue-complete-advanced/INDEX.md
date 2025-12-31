# 📚 Issue Complete - Guía de Documentación

¿No sabes por dónde empezar? Esta guía te ayuda a encontrar exactamente lo que necesitas.

---

## 🎯 ¿Qué necesitas?

### "Quiero resolver UN issue manualmente"
→ **Lee**: `/workflow:issue-complete` (comando principal)
→ **Tiempo**: 5 minutos
→ **Resultado**: Entiendes el flujo básico

### "Quiero resolver 3-5 issues sin intervención"
→ **Lee**: `/workflow:issue-complete` + Ejemplo 2 (en `issue-complete-examples`)
→ **Comando**: `/workflow:issue-complete --loop --max=5`
→ **Tiempo**: 10 minutos

### "Quiero máxima autonomía (CERO intervención)"
→ **Lee**: `/workflow:issue-complete` + Ejemplo 8 (en `issue-complete-examples`)
→ **Comando**: `/workflow:issue-complete --loop --max=20 --autonomous`
→ **Tiempo**: 15 minutos

### "Quiero entender qué hace cada parámetro"
→ **Lee**: `issue-complete-advanced/skill.md` (este directorio)
→ **Secciones**: Parámetros Avanzados
→ **Tiempo**: 20 minutos

### "Mi issue fue rechazado por code review"
→ **Lee**: Ejemplo 5 en `issue-complete-examples`
→ **Sección**: "Auto-Corrección (Fase 4)"
→ **Comando**: `/workflow:issue-complete --loop --auto-fix-reviews=3 --autonomous`

### "Mi PR tiene conflictos de merge"
→ **Lee**: Ejemplo 6 en `issue-complete-examples`
→ **Sección**: "Auto-Resolución de Conflictos (Fase 5)"
→ **Comando**: `/workflow:issue-complete --loop --auto-resolve-conflicts`

### "Tengo una sesión larga y quiero guardar progreso"
→ **Lee**: Ejemplo 7 en `issue-complete-examples`
→ **Sección**: "Persistencia de Sesión (Fase 6)"
→ **Comando**: `/workflow:issue-complete --loop --max=50 --save-session`

### "Mi sesión se pausó, quiero reanudar"
→ **Lee**: Ejemplo 7 (sección "=== 2 HORAS DESPUÉS ===")
→ **Comando**: `/workflow:issue-complete --resume=.claude/session/workflow-session.json`

### "Necesito referencia técnica (JSON, estados, diagramas)"
→ **Lee**: `issue-complete-reference/skill.md`
→ **Secciones**: Estructura de Sesión, Estados, Diagrama de Flujo
→ **Tiempo**: 15 minutos

### "Algo falló, necesito diagnosticar"
→ **Lee**:
  1. Ejemplo del caso similar en `issue-complete-examples`
  2. Troubleshooting en `issue-complete-advanced` o `issue-complete-reference`
  3. Códigos de error en `issue-complete-reference`

---

## 📖 Mapa de Documentación

```
/workflow:issue-complete (COMANDO PRINCIPAL)
├─ 271 líneas
├─ Descripción de 3 modos: Normal, Loop, Autónomo
├─ 7 pasos core simplificados
├─ 2 ejemplos básicos
└─ Links a skills para profundizar

SKILL: issue-complete-advanced/
├─ 850+ líneas
├─ PARA: Usuarios que quieren entender Fases 4-6
├─ CONTIENE:
│  ├─ Parámetros Avanzados (60 líneas)
│  │  ├─ --save-session y --resume
│  │  ├─ --timeout-per-issue
│  │  └─ --max-consecutive-failures
│  ├─ Fases 4-6 (200 líneas)
│  │  ├─ Fase 4: Auto-corrección
│  │  ├─ Fase 5: Auto-conflictos
│  │  └─ Fase 6: Persistencia
│  ├─ Tabla de combinaciones (50 líneas)
│  ├─ Estados (50 líneas)
│  ├─ Timings (50 líneas)
│  └─ Troubleshooting (100 líneas)
└─ TIEMPO: 20-30 min de lectura

SKILL: issue-complete-examples/
├─ 600+ líneas
├─ PARA: Ver flujo real con outputs esperados
├─ CONTIENE:
│  ├─ Ejemplo 1: Modo Normal (8 min)
│  ├─ Ejemplo 2: Bucle (9 min)
│  ├─ Ejemplo 3: Detener bucle (7 min)
│  ├─ Ejemplo 4: Proyecto (12 min)
│  ├─ Ejemplo 5: Auto-corrección (13 min)
│  ├─ Ejemplo 6: Auto-conflictos (15 min)
│  ├─ Ejemplo 7: Persistencia + Reanudación (3.5h)
│  ├─ Ejemplo 8: Autónomo completo (28 min)
│  └─ Troubleshooting para cada caso
└─ TIEMPO: 5-10 min por ejemplo

SKILL: issue-complete-reference/
├─ 400+ líneas
├─ PARA: Referencia técnica y diagnostico
├─ CONTIENE:
│  ├─ Diagrama ASCII (30 líneas)
│  ├─ Estructura JSON de sesión (80 líneas)
│  ├─ Estados (50 líneas)
│  ├─ Tabla parámetros (40 líneas)
│  ├─ Códigos error (60 líneas)
│  ├─ Tabla decisión (50 líneas)
│  ├─ Timings (30 líneas)
│  └─ Matriz responsabilidad (20 líneas)
└─ TIEMPO: 10-15 min de referencia
```

---

## ⚡ Ruta Rápida por Casos

### "Necesito empezar AHORA"
```
1. Lee: /workflow:issue-complete (5 min)
2. Ejecuta: /workflow:issue-complete --loop --max=5
3. Si falla algo → busca en issue-complete-examples (Ejemplo similar)
4. Listo ✅
```

### "Necesito entender TODO antes de empezar"
```
1. Lee: /workflow:issue-complete (5 min)
2. Lee: issue-complete-advanced (parámetros) (15 min)
3. Lee: 2 ejemplos en issue-complete-examples (10 min)
4. Lee: issue-complete-reference (diagrama y errores) (10 min)
5. Ejecuta: /workflow:issue-complete --loop --autonomous
6. Tiempo total: 40 minutos
```

### "Tengo un error específico"
```
1. Busca código de error en issue-complete-reference
2. Lee solución propuesta
3. Busca ejemplo similar en issue-complete-examples
4. Sigue pasos recomendados
5. Si persiste → aumenta timeout o parámetros
```

### "Quiero optimizar mi sesión"
```
1. Lee: issue-complete-advanced (Tabla de combinaciones)
2. Lee: ejemplo más parecido a tu caso en issue-complete-examples
3. Ajusta parámetros según timing en issue-complete-reference
4. Re-ejecuta con nuevos parámetros
```

---

## 🔍 Búsqueda Rápida

### "¿Cómo use --autonomous?"
→ `/workflow:issue-complete` → Sección "Modo Autónomo"

### "¿Qué hace --auto-fix-reviews?"
→ `issue-complete-advanced` → "Parámetros de Auto-Corrección (Fase 4)"

### "¿Cuánto tiempo toma 10 issues?"
→ `issue-complete-reference` → "Timings Típicos"

### "¿Cómo guardo mi sesión?"
→ `issue-complete-advanced` → "--save-session y --resume"

### "¿Qué es el circuit breaker?"
→ `issue-complete-advanced` → "Parámetros de Timeout y Protección"
→ Ejemplo 7 en `issue-complete-examples` → "Circuit Breaker Activado"

### "¿Qué errores puede haber?"
→ `issue-complete-reference` → "Códigos de Error"

### "¿Cuál es el flujo de 7 pasos?"
→ `issue-complete-reference` → "Diagrama de Flujo (7 Pasos)"

### "¿Cómo aumento el timeout?"
→ `issue-complete-advanced` → "--timeout-per-issue=N"
→ Ejemplo 7 en `issue-complete-examples` → Sección reanudación

---

## 📊 Tabla: Cuándo Leer Cada Documento

| Situación | Lee | Tiempo |
|-----------|-----|--------|
| Primer uso | /workflow:issue-complete | 5 min |
| Entender parámetros | issue-complete-advanced | 15 min |
| Ver ejemplos reales | issue-complete-examples | 5-10 min/ejemplo |
| Error o diagnóstico | issue-complete-reference | 5-10 min |
| Optimizar sesión | Todos (tabla) | 20 min |
| Aprender Fases 4-6 | issue-complete-advanced | 25 min |
| Ver outputs esperados | issue-complete-examples | 10 min |
| Entender estructura JSON | issue-complete-reference | 5 min |

---

## 🎯 Próximos Pasos

1. **Primero**: Lee `/workflow:issue-complete`
2. **Segundo**: Ejecuta un issue con `--loop --max=3`
3. **Tercero**: Cuando veas un error, busca en `issue-complete-examples`
4. **Cuarto**: Para optimizar, lee `issue-complete-advanced`
5. **Quinto**: Para diagnosticar, usa `issue-complete-reference`

---

## 💡 Tips

- 📌 Guardar esta página en marcadores para referencia rápida
- 🔗 Los ejemplos en `issue-complete-examples` son copiables al 100%
- ⏱️ Timing en cada ejemplo ayuda a saber qué esperar
- 🔧 Troubleshooting en cada ejemplo cubre 95% de problemas comunes
- 📈 Tabla de compatibilidad en `issue-complete-reference` evita combinaciones inválidas

---

## 🆘 ¿Aún perdido?

**Comunica exactamente qué quieres hacer**:

- ❌ "Issue-complete no funciona" → especifica error
- ✅ "Issue #150 tardó 15 min pero timeout es 10" → especifica

**Luego busca en este orden**:
1. Este INDEX (ahora estás aquí)
2. El skill específico sugerido
3. El ejemplo más parecido a tu caso
4. La sección "Troubleshooting" del ejemplo
5. Los códigos de error en `issue-complete-reference`
