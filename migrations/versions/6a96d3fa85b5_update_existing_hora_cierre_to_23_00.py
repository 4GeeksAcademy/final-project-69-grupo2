"""Update existing hora_cierre to 23:00

Revision ID: 6a96d3fa85b5
Revises: 8da7ee630f8a
Create Date: 2026-04-28 23:08:50.800395

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6a96d3fa85b5'
down_revision = '8da7ee630f8a'
branch_labels = None
depends_on = None


def upgrade():
    # Update existing hora_cierre values to 23:00 where they are NULL or 22:00
    op.execute(
        "UPDATE cancha SET hora_cierre = '23:00' WHERE hora_cierre IS NULL OR hora_cierre = '22:00'")


def downgrade():
    # Revert to 22:00 for existing records
    op.execute(
        "UPDATE cancha SET hora_cierre = '22:00' WHERE hora_cierre = '23:00'")
