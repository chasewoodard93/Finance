"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2025-11-19 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create practices table
    op.create_table(
        'practices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_practices_id'), 'practices', ['id'], unique=False)

    # Create fiscal_years table
    op.create_table(
        'fiscal_years',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('practice_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['practice_id'], ['practices.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_fiscal_years_id'), 'fiscal_years', ['id'], unique=False)

    # Create account_categories table
    op.create_table(
        'account_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category_type', sa.String(length=50), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['account_categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_account_categories_id'), 'account_categories', ['id'], unique=False)

    # Create budget_periods table
    op.create_table(
        'budget_periods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fiscal_year_id', sa.Integer(), nullable=False),
        sa.Column('period_month', sa.Integer(), nullable=False),
        sa.Column('period_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['fiscal_year_id'], ['fiscal_years.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_budget_periods_id'), 'budget_periods', ['id'], unique=False)

    # Create budget_lines table
    op.create_table(
        'budget_lines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('practice_id', sa.Integer(), nullable=False),
        sa.Column('budget_period_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.Integer(), nullable=False),
        sa.Column('budget_amount', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('actual_amount', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('variance', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['budget_period_id'], ['budget_periods.id'], ),
        sa.ForeignKeyConstraint(['category_id'], ['account_categories.id'], ),
        sa.ForeignKeyConstraint(['practice_id'], ['practices.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_budget_lines_id'), 'budget_lines', ['id'], unique=False)

    # Create actuals table
    op.create_table(
        'actuals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('practice_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('period_date', sa.Date(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('source', sa.String(length=50), nullable=True),
        sa.Column('imported_at', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['account_categories.id'], ),
        sa.ForeignKeyConstraint(['practice_id'], ['practices.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_actuals_id'), 'actuals', ['id'], unique=False)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=True),
        sa.Column('practice_id', sa.Integer(), nullable=True),
        sa.Column('last_login', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['practice_id'], ['practices.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create audit_log table
    op.create_table(
        'audit_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('table_name', sa.String(length=100), nullable=False),
        sa.Column('record_id', sa.Integer(), nullable=True),
        sa.Column('changes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_log_id'), 'audit_log', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_audit_log_id'), table_name='audit_log')
    op.drop_table('audit_log')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_actuals_id'), table_name='actuals')
    op.drop_table('actuals')
    op.drop_index(op.f('ix_budget_lines_id'), table_name='budget_lines')
    op.drop_table('budget_lines')
    op.drop_index(op.f('ix_budget_periods_id'), table_name='budget_periods')
    op.drop_table('budget_periods')
    op.drop_index(op.f('ix_account_categories_id'), table_name='account_categories')
    op.drop_table('account_categories')
    op.drop_index(op.f('ix_fiscal_years_id'), table_name='fiscal_years')
    op.drop_table('fiscal_years')
    op.drop_index(op.f('ix_practices_id'), table_name='practices')
    op.drop_table('practices')
