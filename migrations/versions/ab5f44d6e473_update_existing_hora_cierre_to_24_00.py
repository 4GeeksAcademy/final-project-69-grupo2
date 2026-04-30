"""Update existing hora_cierre to 24:00

Revision ID: ab5f44d6e473
Revises: 6a96d3fa85b5
Create Date: 2026-04-28 23:14:04.405498

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ab5f44d6e473'
down_revision = '6a96d3fa85b5'
branch_labels = None
depends_on = None


def upgrade():
    # Actualiza los horarios de cierre existentes a 24:00 cuando estaban en 23:00 o NULL
    op.execute(
        "UPDATE cancha SET hora_cierre = '24:00' WHERE hora_cierre IS NULL OR hora_cierre = '23:00'")


def downgrade():
    # Revertir los cambios anteriores a 23:00 para registros afectados
    op.execute(
        "UPDATE cancha SET hora_cierre = '23:00' WHERE hora_cierre = '24:00'")
