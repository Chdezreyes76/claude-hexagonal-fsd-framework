# Patrones de Codigo Backend

## 1. Entity (domain/entities/)

```python
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Usuario:
    id: Optional[int] = None
    email: str = ""
    nombre: str = ""
    rol: str = "user"
    activo: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
```

## 2. DTOs (application/dtos/)

### Request DTO
```python
from pydantic import BaseModel, EmailStr

class CrearUsuarioRequestDTO(BaseModel):
    email: EmailStr
    nombre: str
    rol: str = "user"

    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "nombre": "Juan Perez",
                "rol": "user"
            }
        }
```

### Response DTO
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UsuarioResponseDTO(BaseModel):
    id: int
    email: str
    nombre: str
    rol: str
    activo: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

## 3. Port (application/ports/)

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.usuario import Usuario

class UsuarioPort(ABC):
    @abstractmethod
    async def crear(self, usuario: Usuario) -> Usuario:
        pass

    @abstractmethod
    async def obtener_por_id(self, id: int) -> Optional[Usuario]:
        pass

    @abstractmethod
    async def listar(self) -> List[Usuario]:
        pass

    @abstractmethod
    async def actualizar(self, usuario: Usuario) -> Usuario:
        pass

    @abstractmethod
    async def eliminar(self, id: int) -> bool:
        pass
```

## 4. Use Case (application/use_cases/)

```python
from typing import List
from application.ports.usuario.usuario_port import UsuarioPort
from application.dtos.usuario.usuario_response_dto import UsuarioResponseDTO

class ListarUsuariosUseCase:
    def __init__(self, usuario_port: UsuarioPort):
        self.usuario_port = usuario_port

    async def execute(self) -> List[UsuarioResponseDTO]:
        usuarios = await self.usuario_port.listar()
        return [UsuarioResponseDTO.model_validate(u) for u in usuarios]
```

```python
from application.ports.usuario.usuario_port import UsuarioPort
from application.dtos.usuario.usuario_request_dto import CrearUsuarioRequestDTO
from application.dtos.usuario.usuario_response_dto import UsuarioResponseDTO
from domain.entities.usuario import Usuario

class CrearUsuarioUseCase:
    def __init__(self, usuario_port: UsuarioPort):
        self.usuario_port = usuario_port

    async def execute(self, dto: CrearUsuarioRequestDTO) -> UsuarioResponseDTO:
        usuario = Usuario(
            email=dto.email,
            nombre=dto.nombre,
            rol=dto.rol
        )
        usuario_creado = await self.usuario_port.crear(usuario)
        return UsuarioResponseDTO.model_validate(usuario_creado)
```

## 5. Model SQLAlchemy (adapter/outbound/database/models/)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from core.database import Base

class UsuarioModel(Base):
    __tablename__ = "auth_usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    rol = Column(String(50), default="user")
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    def to_entity(self) -> "Usuario":
        from domain.entities.usuario import Usuario
        return Usuario(
            id=self.id,
            email=self.email,
            nombre=self.nombre,
            rol=self.rol,
            activo=self.activo,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @classmethod
    def from_entity(cls, entity: "Usuario") -> "UsuarioModel":
        return cls(
            id=entity.id,
            email=entity.email,
            nombre=entity.nombre,
            rol=entity.rol,
            activo=entity.activo
        )
```

## 6. Repository (adapter/outbound/database/repositories/)

```python
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from application.ports.usuario.usuario_port import UsuarioPort
from domain.entities.usuario import Usuario
from adapter.outbound.database.models.usuario_model import UsuarioModel

class UsuarioRepository(UsuarioPort):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def crear(self, usuario: Usuario) -> Usuario:
        model = UsuarioModel.from_entity(usuario)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return model.to_entity()

    async def obtener_por_id(self, id: int) -> Optional[Usuario]:
        result = await self.session.execute(
            select(UsuarioModel).where(UsuarioModel.id == id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def listar(self) -> List[Usuario]:
        result = await self.session.execute(select(UsuarioModel))
        models = result.scalars().all()
        return [m.to_entity() for m in models]

    async def actualizar(self, usuario: Usuario) -> Usuario:
        model = await self.session.get(UsuarioModel, usuario.id)
        if model:
            model.email = usuario.email
            model.nombre = usuario.nombre
            model.rol = usuario.rol
            model.activo = usuario.activo
            await self.session.commit()
            await self.session.refresh(model)
            return model.to_entity()
        raise ValueError(f"Usuario {usuario.id} no encontrado")

    async def eliminar(self, id: int) -> bool:
        model = await self.session.get(UsuarioModel, id)
        if model:
            await self.session.delete(model)
            await self.session.commit()
            return True
        return False
```

## 7. Router (adapter/inbound/api/routers/)

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from application.dtos.common.base_response_dto import ResponseDTO
from application.dtos.usuario.usuario_request_dto import CrearUsuarioRequestDTO
from application.dtos.usuario.usuario_response_dto import UsuarioResponseDTO
from application.use_cases.usuario.listar_usuarios_use_case import ListarUsuariosUseCase
from application.use_cases.usuario.crear_usuario_use_case import CrearUsuarioUseCase
from adapter.inbound.api.dependencies.usuario.usuario_dependency import (
    get_listar_usuarios_use_case,
    get_crear_usuario_use_case
)

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.get("", response_model=ResponseDTO[List[UsuarioResponseDTO]])
async def listar_usuarios(
    use_case: ListarUsuariosUseCase = Depends(get_listar_usuarios_use_case)
):
    try:
        usuarios = await use_case.execute()
        return ResponseDTO.success(data=usuarios)
    except Exception as e:
        return ResponseDTO.error(message=str(e))

@router.post("", response_model=ResponseDTO[UsuarioResponseDTO])
async def crear_usuario(
    dto: CrearUsuarioRequestDTO,
    use_case: CrearUsuarioUseCase = Depends(get_crear_usuario_use_case)
):
    try:
        usuario = await use_case.execute(dto)
        return ResponseDTO.success(data=usuario, message="Usuario creado")
    except Exception as e:
        return ResponseDTO.error(message=str(e))
```

## 8. Dependencies (adapter/inbound/api/dependencies/)

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_session
from adapter.outbound.database.repositories.usuario_repository import UsuarioRepository
from application.use_cases.usuario.listar_usuarios_use_case import ListarUsuariosUseCase
from application.use_cases.usuario.crear_usuario_use_case import CrearUsuarioUseCase

async def get_usuario_repository(
    session: AsyncSession = Depends(get_session)
) -> UsuarioRepository:
    return UsuarioRepository(session)

async def get_listar_usuarios_use_case(
    repo: UsuarioRepository = Depends(get_usuario_repository)
) -> ListarUsuariosUseCase:
    return ListarUsuariosUseCase(repo)

async def get_crear_usuario_use_case(
    repo: UsuarioRepository = Depends(get_usuario_repository)
) -> CrearUsuarioUseCase:
    return CrearUsuarioUseCase(repo)
```

## 9. Registrar en main.py

```python
from adapter.inbound.api.routers.usuario_router import router as usuario_router

app.include_router(usuario_router, prefix="/api/v1")
```

## 10. Migracion Alembic

```bash
alembic revision --autogenerate -m "Create usuarios table"
alembic upgrade head
```
