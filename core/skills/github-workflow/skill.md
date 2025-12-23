---
name: github-workflow
description: Convenciones de GitHub del proyecto - branches, commits, PRs, issues y labels. Usar cuando se trabaje con git, se creen commits, branches o pull requests.
allowed-tools: Bash(git:*), Bash(gh:*)
---

# GitHub Workflow - {{projectName}}

Este skill define las convenciones de trabajo con GitHub para el proyecto.

## Sistema de Labels

### Por Tipo
| Label | Uso |
|-------|-----|
| `type: feature` | Nueva funcionalidad |
| `type: bug` | Algo no funciona |
| `type: refactor` | Mejora de codigo |
| `type: docs` | Documentacion |
| `type: test` | Tests |
| `type: chore` | Mantenimiento |
| `type: spike` | Investigacion |

### Por Prioridad
| Label | Uso |
|-------|-----|
| `priority: critical` | Bloquea produccion |
| `priority: high` | Resolver pronto |
| `priority: medium` | Planificar en sprint |
| `priority: low` | Cuando haya tiempo |

### Por Area
| Label | Uso |
|-------|-----|
| `area: backend` | FastAPI, Python |
| `area: frontend` | React, TypeScript |
| `area: database` | MySQL, Alembic |
| `area: infra` | Docker, CI/CD |
| `area: api` | Endpoints, DTOs |

### Por Dominio
| Label | Uso |
|-------|-----|
| `domain: usuarios` | Autenticacion, roles |
| `domain: centros-coste` | Areas, departamentos |
| `domain: personal` | Empleados, FTE |
| `domain: nominas` | Payroll, ADISS |
| `domain: redistribucion` | Criterios reparto |
| `domain: contabilidad` | Plan contable |

### Por Estado
| Label | Uso |
|-------|-----|
| `status: needs-triage` | Pendiente clasificar |
| `status: ready` | Listo para empezar |
| `status: blocked` | Tiene dependencia |
| `status: needs-info` | Falta informacion |
| `status: in-review` | PR en revision |

### Por Tamano
| Label | Tiempo |
|-------|--------|
| `size: XS` | < 1 hora |
| `size: S` | 1-4 horas |
| `size: M` | 4-8 horas |
| `size: L` | 2-3 dias |
| `size: XL` | 1 semana+ |

## Nombres de Branch

```
tipo/issue#-descripcion-corta
```

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Feature | `feat/` | `feat/42-filtro-fecha-nominas` |
| Bug | `fix/` | `fix/15-error-login-google` |
| Refactor | `refactor/` | `refactor/23-hexagonal-usuarios` |
| Docs | `docs/` | `docs/10-readme-setup` |
| Test | `test/` | `test/8-unit-tests-nominas` |
| Chore | `chore/` | `chore/5-update-deps` |

## Mensajes de Commit

Formato Conventional Commits:

```
tipo(scope): descripcion #issue
```

### Tipos validos
- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Documentacion
- `style`: Formato (no afecta logica)
- `refactor`: Refactorizacion
- `test`: Tests
- `chore`: Mantenimiento

### Ejemplos
```
feat(nominas): add date filter component #42
fix(auth): resolve Google OAuth callback error #15
refactor(usuarios): migrate to hexagonal architecture #23
docs(readme): update installation steps #5
test(nominas): add unit tests for filters #30
```

## Pull Requests

### Titulo
```
tipo(scope): descripcion
```

### Body
```markdown
Closes #<issue>

## Summary
- Cambio principal 1
- Cambio principal 2

## Changes
- Lista de archivos modificados

## Test Plan
- [ ] Tests unitarios
- [ ] Tests de integracion
- [ ] Prueba manual

---
Generated with Claude Code
```

## Flujo de Trabajo

```
1. Crear Issue
   -> Labels: type:*, status:needs-triage
   -> Project: Backlog

2. Refinar Issue
   -> Anadir: priority:*, size:*, area:*, domain:*
   -> Cambiar: status:needs-triage -> status:ready
   -> Project: Ready

3. Iniciar Trabajo
   -> Crear branch: tipo/issue#-descripcion
   -> Asignar issue
   -> Project: In Progress

4. Desarrollo
   -> Commits: tipo(scope): mensaje #issue

5. Crear PR
   -> Anadir: status:in-review
   -> Project: In Review

6. Merge
   -> Issue se cierra automaticamente (Closes #issue)
   -> Project: Done
```

## Comandos Utiles

```bash
# Crear issue
gh issue create --title "titulo" --label "type: feature"

# Ver issue
gh issue view 42

# Crear branch desde issue
git checkout -b feat/42-descripcion

# Crear PR
gh pr create --title "feat(scope): descripcion" --body "Closes #42"

# Ver PRs pendientes
gh pr list

# Mergear PR
gh pr merge --squash
```
