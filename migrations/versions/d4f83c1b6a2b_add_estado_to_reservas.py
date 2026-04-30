"""add estado to reservas

Revision ID: d4f83c1b6a2b
Revises: 8da7ee630f8a
Create Date: 2026-04-30 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd4f83c1b6a2b'
down_revision = '8da7ee630f8a'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('reservas', schema=None) as batch_op:
        batch_op.add_column(sa.Column('estado', sa.String(
            length=20), nullable=False, server_default='pendiente'))


def downgrade():
    with op.batch_alter_table('reservas', schema=None) as batch_op:
        batch_op.drop_column('estado')
