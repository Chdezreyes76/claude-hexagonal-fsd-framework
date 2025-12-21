# 🎯 Issue Workflow Orchestrator

Automatiza el flujo completo de issues: desde seleccionar → implementar → validar → mergear → siguiente.

## Instalación

El skill ya está disponible. Solo úsalo:

```bash
/workflow:issue-complete
```

## Uso Rápido

```bash
# Iniciar flujo automatizado
/workflow:issue-complete

# Durante la sesión:
- "listo"       → Issue implementado, pasar a PR
- "pausa"       → Pausar workflow actual
- "salir"       → Terminar y volver a master
- "recheck"     → Re-ejecutar review si falló
- "ayuda"       → Mostrar opciones
```

## Qué Hace

```
1. Analiza los 3 issues más urgentes
2. Tú seleccionas cuál resolver
3. Crea rama y asigna issue
4. Espera a que implementes
5. Crea PR automáticamente
6. Ejecuta /quality:review (CRÍTICO ⭐)
7. Mergea si está OK
8. Loop al siguiente issue
```

## Ventajas vs Manual

| Aspecto | Manual | Workflow |
|---------|--------|----------|
| Pasos | 7 comandos | 1 comando |
| Review olvidado | ⚠️ SÍ | ✅ NO |
| Consistencia | ❌ Depende usuario | ✅ Garantizado |
| Velocidad | Lento | Rápido |
| Calidad código | Variable | Consistente |

## Configuración

Edita `.claude/skills/issue-workflow/config.json`:

```json
{
  "autoReview": true,         // Ejecutar review automático
  "autoMerge": true,          // Mergear si aprueba
  "stopOnReviewFails": true,  // Parar si falla review
  "requireTests": false,      // No requerir tests
  "priorityFilter": "high|medium|low"
}
```

## Ejemplo de Sesión

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Issue Workflow Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 [1/7] Analizando issues...

  🔴 #184 [MEDIA] OverrideButton N+1 queries
     Sin asignar | 3 días antiguo

  🟡 #182 [MEDIA] Duplicación SelectValue ImportarGastosTab
     Sin asignar | 2 días antiguo

  🟢 #180 [MEDIA] Archivo demasiado grande ConsultarMovimientosTab
     Sin asignar | 1 día antiguo

Selecciona issue a resolver: #184

🔧 [2/7] Iniciando trabajo...

  ✅ Branch creada: fix/184-override-button-memoizacion
  ✅ Issue asignado a ti
  ✅ Plan obtenido de issue-planner

📝 PLAN RESUMIDO:
  - Crear endpoint batch verification en backend
  - Refactor MovimientosPage con hook batch
  - Eliminar 50 queries N+1
  - Ganancia: 500ms → 50ms en carga

⏳ [3/7] Esperando implementación...

  Cuando termines, di "listo"
  (Los commits se hacen normalmente en la rama)

→ listo

📬 [4/7] Creando PR...

  ✅ PR #204 creado
  ✅ Vinculado a #184
  ✅ Descripción auto-generada

⭐ [5/7] Code Review (CRÍTICO)...

  Validando patrones FSD...
    ✅ FSD Architecture respetado
    ✅ Imports correctos (@/hooks, @/services)
    ✅ Barrel exports mantenidos

  Validando TypeScript...
    ✅ Sin errores de tipo
    ✅ `any` usado apropiadamente
    ✅ Type safety OK

  Validando Commits...
    ✅ Convencional Commits format
    ✅ Messages claros
    ✅ #184 incluido

  Validando código...
    ✅ No duplicación
    ✅ Reutilización de código
    ✅ Performance mejorado

  ✅ APROBADO

✨ [6/7] Mergeando...

  ✅ PR mergeado a master
  ✅ Rama limpiada
  ✅ Cambios en master

🔄 [7/7] Siguiente issue...

  📊 [1/7] Analizando issues...

    🟡 #182 [MEDIA] Duplicación SelectValue ImportarGastosTab
    🟢 #180 [MEDIA] Archivo demasiado grande ConsultarMovimientosTab
    🟢 #178 [MEDIA] Exceso estado local SubcuentasPage

  Selecciona issue a resolver: #182

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Sesión en progreso: 2 issues completados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Manejo de Errores

### Si review falla:

```
⭐ [5/7] Code Review...
  ❌ FALLIDO

  Errores encontrados:
  - TypeScript error: unused variable en línea 42
  - FSD violation: imports from @/services en pages/
  - Missing test para nueva funcionalidad

Opciones:
  1. "recheck"  → Volver a editar y revisar
  2. "salir"    → Abortar workflow
  3. "ayuda"    → Ver más opciones
```

### Si mergea falla:

```
✨ [6/7] Mergeando...
  ❌ FALLIDO

  Error: Conflicto con master

  Opciones:
  1. "resolv"   → Resolver conflicto manualmente
  2. "salir"    → Abortar y volver a master
  3. "rebase"   → Rebase sobre master
```

## Pausar y Continuar

```bash
# Durante la sesión
→ pausa

# Vuelve a master, para todo
# Puedes editar, hacer commits, etc.

# Cuando quieras continuar
/workflow:issue-complete --resume

# Continúa donde dejó
```

## Configuración Avanzada

### Solo issues de alta prioridad:

```json
{
  "priorityFilter": ["critical", "high"]
}
```

### Requiere tests para code review:

```json
{
  "requireTests": true
}
```

### Sin mergear automático (solo PR):

```json
{
  "autoMerge": false
}
```

## Histórico de Sesión

Al terminar, ves un resumen:

```
📊 SESIÓN COMPLETADA

Issues resueltos:    3
PRs creados:         3
PRs mergeados:       3
Tiempo total:        ~2 horas
Calidad:             100% (todos reviews aprobados)

Issues pendientes:   12
├─ CRITICAL:         0
├─ HIGH:             2
├─ MEDIUM:           7
└─ LOW:              3

Próximos pasos:
  /workflow:issue-complete  → Continuar con HIGH priority
```

## Troubleshooting

### "El workflow está en loop"
- Es normal, eso es por diseño
- Di "salir" para terminar sesión
- O "pausa" para pausar temporalmente

### "Olvidé un commit"
- Di "pausa" para pausar
- Haz el commit manualmente
- Continúa con /workflow:issue-complete --resume

### "PR no se creó"
- Verifica que hay cambios en la rama
- Comprueba que no hay cambios sin commit
- Intenta manualmente: /github:pr

## Notas

- El workflow siempre mantiene un estado consistente
- Si algo falla, siempre puedes volver a master limpio
- Los commits se hacen normalmente (no automático)
- Solo PR y merge son automáticos (y optional)

## Contacto / Soporte

Si hay problemas con el workflow:
1. Di "pausa"
2. Ejecuta: `git status`
3. Reporta el estado en el issue
