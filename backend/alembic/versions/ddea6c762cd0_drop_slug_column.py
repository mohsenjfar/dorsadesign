"""drop leftover slug column

Revision ID: ddea6c762cd0
Revises: 4772d5a0e321
Create Date: 2026-08-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ddea6c762cd0'
down_revision: Union[str, None] = '4772d5a0e321'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ستون slug قبلاً از مدل و ایندکسش از مایگریشن قبلی حذف شده بود،
    # ولی خود ستون (NOT NULL) توی جدول باقی مونده بود و باعث خطای insert می‌شد
    op.drop_column('projects', 'slug')


def downgrade() -> None:
    op.add_column(
        'projects',
        sa.Column('slug', sa.VARCHAR(length=255), autoincrement=False, nullable=True, comment='Unique URL identifier'),
    )
