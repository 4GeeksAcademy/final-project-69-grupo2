from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime, func
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(120), nullable=False)
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
        return {"id": self.id,
                "username": self.username,
                "email": self.email,
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
    
    categoria_id: Mapped[int] = mapped_column(db.ForeignKey("categoria.id"), nullable=True)
    categoria: Mapped["Categoria"] = relationship(back_populates="complejos")
    canchas: Mapped[list["Cancha"]] = relationship(back_populates="complejo")


    def serialize(self):
        return {
            "id": self.id,
            "name": self.nombre,
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
    
    complejo_id: Mapped[int] = mapped_column(db.ForeignKey("complejo.id"), nullable=False)
    categoria_id: Mapped[int] = mapped_column(db.ForeignKey("categoria.id"), nullable=True)
    
    complejo: Mapped["Complejo"] = relationship(back_populates="canchas")
    categoria: Mapped["Categoria"] = relationship()

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "complejo_id": self.complejo_id,
            "categoria_nombre": self.categoria.nombre if self.categoria else "Sin categoría"
        }