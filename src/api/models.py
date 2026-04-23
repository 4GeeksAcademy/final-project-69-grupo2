from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {"id": self.id, "email": self.email}


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
    imagen_url: Mapped[str] = mapped_column(String(300), nullable=True)
    categoria_id: Mapped[int] = mapped_column(
        db.ForeignKey("categoria.id"), nullable=False)
    categoria: Mapped["Categoria"] = relationship(back_populates="complejos")
    canchas: Mapped[list["Cancha"]] = relationship(back_populates="complejo")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "imagen_url": self.imagen_url,
            "categoria": self.categoria.nombre
        }


class Cancha(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    complejo_id: Mapped[int] = mapped_column(
        db.ForeignKey("complejo.id"), nullable=False)
    complejo: Mapped["Complejo"] = relationship(back_populates="canchas")

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "complejo_id": self.complejo_id
        }
