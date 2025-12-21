# Patrones de Codigo Frontend

## 1. Types (entities/{entity}/model/types.ts)

```typescript
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'manager' | 'user';
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearUsuarioRequest {
  email: string;
  nombre: string;
  rol?: string;
}

export interface UsuarioFilters {
  rol?: string;
  activo?: boolean;
  search?: string;
}
```

## 2. Service (services/{dominio}.service.ts)

```typescript
import api from '@/lib/api';
import type { Usuario, CrearUsuarioRequest, UsuarioFilters } from '@/entities/usuario/model/types';

const BASE_URL = '/usuarios';

export const usuarioService = {
  getAll: async (filters?: UsuarioFilters): Promise<Usuario[]> => {
    const params = new URLSearchParams();
    if (filters?.rol) params.append('rol', filters.rol);
    if (filters?.activo !== undefined) params.append('activo', String(filters.activo));
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`${BASE_URL}?${params}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  create: async (data: CrearUsuarioRequest): Promise<Usuario> => {
    const response = await api.post(BASE_URL, data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
```

## 3. Hooks (hooks/use{Dominio}.ts)

### Query Hook (lectura)

```typescript
import { useQuery } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuario.service';
import type { UsuarioFilters } from '@/entities/usuario/model/types';

export const useUsuarios = (filters?: UsuarioFilters) => {
  return useQuery({
    queryKey: ['usuarios', filters],
    queryFn: () => usuarioService.getAll(filters),
  });
};

export const useUsuario = (id: number) => {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => usuarioService.getById(id),
    enabled: !!id,
  });
};
```

### Mutation Hook (escritura)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuario.service';
import type { CrearUsuarioRequest } from '@/entities/usuario/model/types';
import { toast } from 'sonner';

export const useCrearUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearUsuarioRequest) => usuarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useEliminarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};
```

## 4. Componente UI (components/)

```typescript
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

## 5. Widget (widgets/)

```typescript
import { useUsuarios } from '@/hooks/useUsuarios';
import { useEliminarUsuario } from '@/hooks/useUsuarioMutations';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import type { Usuario } from '@/entities/usuario/model/types';

interface UsuarioListProps {
  onSelect?: (usuario: Usuario) => void;
}

export const UsuarioList = ({ onSelect }: UsuarioListProps) => {
  const { data: usuarios, isLoading, error } = useUsuarios();
  const eliminarMutation = useEliminarUsuario();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {usuarios?.map((usuario) => (
        <Card key={usuario.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{usuario.nombre}</h3>
              <p className="text-sm text-gray-500">{usuario.email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onSelect?.(usuario)}
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="danger"
                isLoading={eliminarMutation.isPending}
                onClick={() => eliminarMutation.mutate(usuario.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

## 6. Page (pages/)

```typescript
import { useState } from 'react';
import { UsuarioList } from '@/widgets/UsuarioList';
import { UsuarioDetalle } from '@/widgets/UsuarioDetalle';
import { CrearUsuarioModal } from '@/widgets/CrearUsuarioModal';
import { Button } from '@/components/Button';
import type { Usuario } from '@/entities/usuario/model/types';

export const UsuariosPage = () => {
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UsuarioList onSelect={setSelectedUsuario} />
        </div>
        <div>
          {selectedUsuario && (
            <UsuarioDetalle usuario={selectedUsuario} />
          )}
        </div>
      </div>

      <CrearUsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
```

## 7. Feature Hook (features/{feature}/hooks/)

```typescript
// features/usuario-filters/hooks/useUsuarioFilters.ts
import { useState, useMemo } from 'react';
import type { Usuario, UsuarioFilters } from '@/entities/usuario/model/types';

export const useUsuarioFilters = (usuarios: Usuario[]) => {
  const [filters, setFilters] = useState<UsuarioFilters>({});

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      if (filters.rol && usuario.rol !== filters.rol) return false;
      if (filters.activo !== undefined && usuario.activo !== filters.activo) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          usuario.nombre.toLowerCase().includes(search) ||
          usuario.email.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [usuarios, filters]);

  return {
    filters,
    setFilters,
    filteredUsuarios,
    clearFilters: () => setFilters({}),
  };
};
```

## 8. Context (contexts/)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import type { Usuario } from '@/entities/usuario/model/types';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (user: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  const login = (user: Usuario) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## 9. API Client (lib/api.ts)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 10. Router (router/index.tsx)

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { UsuariosPage } from '@/pages/Usuarios/UsuariosPage';
import { NominasPage } from '@/pages/Nominas/NominasPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'nominas', element: <NominasPage /> },
    ],
  },
]);
```
