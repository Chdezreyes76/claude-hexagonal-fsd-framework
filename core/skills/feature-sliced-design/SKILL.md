---
name: feature-sliced-design
description: Patrones de Feature-Sliced Design del frontend React. Usar cuando se trabaje con codigo TypeScript/React, componentes, hooks, servicios o paginas.
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Feature-Sliced Design - Frontend Patterns

Este skill define los patrones de Feature-Sliced Design (FSD) del frontend React 19 + TypeScript.

## Estructura de Directorios

```
frontend/src/
├── components/        # Componentes UI compartidos (Button, Card, Modal)
├── entities/          # Entidades de negocio
│   └── {entity}/
│       ├── model/     # Tipos e interfaces
│       └── api/       # Cliente API de la entidad
├── features/          # Logica de features especificas
│   └── {feature}/
│       ├── hooks/     # Hooks de la feature
│       └── components/ # Componentes de la feature
├── widgets/           # Componentes compuestos complejos
├── pages/             # Paginas de la aplicacion
├── hooks/             # Hooks globales compartidos
├── services/          # Clientes API y servicios externos
├── contexts/          # React Contexts
├── lib/               # Utilidades y helpers
└── router/            # Configuracion de rutas
```

## Reglas de Dependencia

Las capas solo pueden importar de capas inferiores:

```
pages     → widgets, features, entities, components
widgets   → features, entities, components
features  → entities, components
entities  → components
components → (self-contained, sin logica de negocio)
```

## Convenciones de Nombres

| Componente | Patron | Ejemplo |
|------------|--------|---------|
| Componente | `PascalCase` | `UserCard.tsx` |
| Hook | `use{Nombre}` | `useUsuarios.ts` |
| Service | `{dominio}.service.ts` | `nominas.service.ts` |
| Types | `types.ts` o `{dominio}.types.ts` | `types.ts` |
| Page | `{Nombre}Page.tsx` | `NominasPage.tsx` |
| Widget | Descriptivo | `DetalleTrabajador.tsx` |

## Stack Tecnologico

- **React 19** + TypeScript
- **TanStack Query** (React Query) para estado servidor
- **TailwindCSS v4** para estilos
- **React Router** para navegacion
- **Vite** como bundler

## Patron de API

Usar TanStack Query para todas las llamadas API:

```typescript
// services/{dominio}.service.ts
export const fetchUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get('/usuarios');
  return response.data.data;
};

// hooks/useUsuarios.ts
export const useUsuarios = () => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios,
  });
};

// En componentes
const { data, isLoading, error } = useUsuarios();
```

## Estilos

Usar TailwindCSS con la utilidad `cn()` para merge de clases:

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />
```

## Referencias

Ver [FRONTEND_PATTERNS.md](FRONTEND_PATTERNS.md) para ejemplos de codigo detallados.
