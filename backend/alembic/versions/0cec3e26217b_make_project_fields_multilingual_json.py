"""make_project_fields_multilingual_json

Revision ID: 0cec3e26217b
Revises: df927fcb46cd
Create Date: 2026-06-22 14:49:15.502063

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0cec3e26217b'
down_revision: Union[str, None] = 'df927fcb46cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ============================================
    # 1. اضافه کردن ستون features (JSON)
    # ============================================
    op.add_column(
        'projects',
        sa.Column(
            'features',
            postgresql.JSON(astext_type=sa.Text()),
            nullable=True,
            comment="Multilingual features: {'en': ['feat1', 'feat2'], 'fa': ['...']}"
        )
    )

    # ============================================
    # 2. تبدیل ستون title به JSON با USING
    # ============================================
    # ابتدا ایندکس را حذف می‌کنیم (اگر وجود داشته باشد)
    op.drop_index('ix_projects_title', table_name='projects', if_exists=True)
    
    # تبدیل با USING
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN title TYPE JSON 
        USING jsonb_build_object('en', title, 'fa', title)
    """)
    
    # تنظیم کامنت
    op.alter_column(
        'projects',
        'title',
        comment="Multilingual title: {'en': '...', 'fa': '...'}",
        existing_nullable=False
    )

    # ============================================
    # 3. تبدیل ستون description به JSON با USING
    # ============================================
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN description TYPE JSON 
        USING CASE 
            WHEN description IS NULL THEN NULL 
            ELSE jsonb_build_object('en', description, 'fa', description) 
        END
    """)
    
    op.alter_column(
        'projects',
        'description',
        comment="Multilingual short description: {'en': '...', 'fa': '...'}",
        existing_nullable=True
    )

    # ============================================
    # 4. تبدیل ستون full_description به JSON با USING
    # ============================================
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN full_description TYPE JSON 
        USING CASE 
            WHEN full_description IS NULL THEN NULL 
            ELSE jsonb_build_object('en', full_description, 'fa', full_description) 
        END
    """)
    
    op.alter_column(
        'projects',
        'full_description',
        comment="Multilingual full description: {'en': '...', 'fa': '...'}",
        existing_nullable=True
    )


def downgrade() -> None:
    # ============================================
    # برگشت به حالت قبلی (VARCHAR/TEXT)
    # ============================================
    
    # 1. برگشت full_description به TEXT
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN full_description TYPE TEXT 
        USING full_description->>'en'
    """)
    op.alter_column(
        'projects',
        'full_description',
        comment='Full project description',
        existing_nullable=True
    )

    # 2. برگشت description به TEXT
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN description TYPE TEXT 
        USING description->>'en'
    """)
    op.alter_column(
        'projects',
        'description',
        comment='Short description',
        existing_nullable=True
    )

    # 3. برگشت title به VARCHAR
    op.execute("""
        ALTER TABLE projects 
        ALTER COLUMN title TYPE VARCHAR(255) 
        USING title->>'en'
    """)
    op.alter_column(
        'projects',
        'title',
        comment='Project title',
        existing_nullable=False
    )

    # 4. حذف ستون features
    op.drop_column('projects', 'features')

    # 5. بازگرداندن ایندکس title (اختیاری)
    op.create_index('ix_projects_title', 'projects', ['title'], unique=False)