from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, func
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship, declarative_base
import enum

db = SQLAlchemy()

Base = declarative_base()


class Role(enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"

class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(120), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=True)
    role: Mapped[Role] = mapped_column(db.Enum(Role), default=Role.USER, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    salt: Mapped[str] = mapped_column(String(120), nullable=False)
    avatar_url: Mapped[str] = mapped_column(
        String(180), default="http://i.pravatar.cc/300", nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), default=True, nullable=False)
    create_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)
    update_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "email": self.email,
            "role": self.role.value,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active
        }


class Categoria(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True)
    complejos: Mapped[list["Complejo"]] = relationship(
        back_populates="categoria")

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre}


class Complejo(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    address: Mapped[str] = mapped_column(String(200), nullable=True)
    country: Mapped[str] = mapped_column(String(80), nullable=True)
    city: Mapped[str] = mapped_column(String(80), nullable=True)
    google_map: Mapped[str] = mapped_column(String(500), nullable=True)
    imagen_url: Mapped[str] = mapped_column(String(300), nullable=True)
    categoria_id: Mapped[int] = mapped_column(
        db.ForeignKey("categoria.id"), nullable=True)
    categoria: Mapped["Categoria"] = relationship(back_populates="complejos")
    canchas: Mapped[list["Cancha"]] = relationship(back_populates="complejo")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "country": self.country,
            "city": self.city,
            "google_map": self.google_map,
            "imagen_url": self.imagen_url,
            "categoria": self.categoria.nombre if self.categoria else "Sin categoría"
        }


class Cancha(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    precio_hora: Mapped[float] = mapped_column(db.Float, nullable=True)
    foto_url: Mapped[str] = mapped_column(String(300), nullable=True)

    hora_apertura: Mapped[str] = mapped_column(
        String(10), nullable=True, default="08:00")
    hora_cierre: Mapped[str] = mapped_column(
        String(10), nullable=True, default="24:00")

    complejo_id: Mapped[int] = mapped_column(
        db.ForeignKey("complejo.id"), nullable=False)
    categoria_id: Mapped[int] = mapped_column(
        db.ForeignKey("categoria.id"), nullable=True)

    complejo: Mapped["Complejo"] = relationship(back_populates="canchas")
    categoria: Mapped["Categoria"] = relationship()
    reservas: Mapped[list["Reserva"]] = relationship(
        back_populates="cancha", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio_hora": self.precio_hora,
            "foto_url": self.foto_url,
            "hora_apertura": self.hora_apertura,
            "hora_cierre": self.hora_cierre,
            "complejo_id": self.complejo_id,
            "complejo_nombre": self.complejo.nombre if self.complejo else "Sin complejo",
            "categoria_nombre": self.categoria.nombre if self.categoria else "Sin categoría"
        }


class Reserva(db.Model):
    __tablename__ = 'reservas'
    id: Mapped[int] = mapped_column(primary_key=True)
    fecha: Mapped[str] = mapped_column(String(20), nullable=False)
    hora: Mapped[str] = mapped_column(String(10), nullable=False)
    es_bloqueo: Mapped[bool] = mapped_column(
        db.Boolean, default=False, nullable=False)

    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("users.id"), nullable=True)
    cancha_id: Mapped[int] = mapped_column(
        db.ForeignKey("cancha.id"), nullable=False)
    estado: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pendiente")

    user: Mapped["User"] = relationship()
    cancha: Mapped["Cancha"] = relationship(back_populates="reservas")

    def serialize(self):
        return {
            "id": self.id,
            "fecha": self.fecha,
            "hora": self.hora,
            "es_bloqueo": self.es_bloqueo,
            "user_id": self.user_id,
            "cancha_id": self.cancha_id,
            "cancha_nombre": self.cancha.nombre if self.cancha else None,
            "complejo_nombre": self.cancha.complejo.nombre if self.cancha and self.cancha.complejo else None,
            "complejo_id": self.cancha.complejo_id if self.cancha else None,
            "estado": self.estado
        }
