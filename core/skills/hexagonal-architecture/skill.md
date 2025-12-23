---
name: hexagonal-architecture
description: Patrones de arquitectura hexagonal del backend FastAPI. Usar cuando se trabaje con codigo Python del backend, creacion de endpoints, use cases, repositorios o entidades.
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Arquitectura Hexagonal - Backend Patterns

Este skill define los patrones de arquitectura hexagonal (Ports & Adapters) del backend FastAPI.

## Estructura de Directorios

```
backend/
├── domain/              # Logica de negocio pura
│   └── entities/        # Entidades del dominio
├── application/         # Casos de uso y servicios
│   ├── use_cases/       # Operaciones de negocio (un archivo por use case)
│   ├── ports/           # Interfaces/contratos
│   └── dtos/            # Data Transfer Objects
├── adapter/
│   ├── inbound/         # Puntos de entrada
│   │   └── api/
│   │       ├── routers/       # Endpoints FastAPI
│   │       └── dependencies/  # Inyeccion de dependencias
│   └── outbound/        # Puntos de salida
│       ├── database/
│       │   ├── models/        # Modelos SQLAlchemy
│       │   └── repositories/  # Implementaciones de ports
│       └── external/          # Clientes APIs externas
└── core/                # Infraestructura (config, logging, security)
```

## Convenciones de Nombres

| Componente | Patron | Ejemplo |
|------------|--------|---------|
| Entity | `{Nombre}` | `Usuario`, `Departamento` |
| Use Case | `{accion}_{dominio}_use_case.py` | `crear_usuario_use_case.py` |
| Port | `{dominio}_port.py` | `usuario_port.py` |
| Repository | `{dominio}_repository.py` | `usuario_repository.py` |
| Model | `{dominio}_model.py` | `usuario_model.py` |
| Router | `{dominio}_router.py` | `usuario_router.py` |
| DTO Request | `{dominio}_request_dto.py` | `usuario_request_dto.py` |
| DTO Response | `{dominio}_response_dto.py` | `usuario_response_dto.py` |

## Flujo de Datos

```
Request → Router → Use Case → Port (interface) → Repository → Model → DB
                                    ↓
Response ← DTO ← Use Case ← Port ← Repository ← Model ← DB
```

## Patron de Respuestas

Todas las respuestas usan `ResponseDTO[T]`:

```python
from application.dtos.common.base_response_dto import ResponseDTO

# Exito
return ResponseDTO.success(data=usuario_dto, message="Usuario creado")

# Error
return ResponseDTO.error(message="Error", errors=["Detalle"])
```

## Creacion de Nuevo Dominio

Orden de creacion:
1. Entity en `domain/entities/{dominio}.py`
2. DTOs en `application/dtos/{dominio}/`
3. Port en `application/ports/{dominio}/{dominio}_port.py`
4. Use cases en `application/use_cases/{dominio}/`
5. Model en `adapter/outbound/database/models/{dominio}_model.py`
6. Repository en `adapter/outbound/database/repositories/{dominio}_repository.py`
7. Router en `adapter/inbound/api/routers/{dominio}_router.py`
8. Dependencies en `adapter/inbound/api/dependencies/{dominio}/`
9. Registrar router en `main.py`
10. Migracion Alembic

## Referencias

Ver [BACKEND_PATTERNS.md](BACKEND_PATTERNS.md) para ejemplos de codigo detallados.
