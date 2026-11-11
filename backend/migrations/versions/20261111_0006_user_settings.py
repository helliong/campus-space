"""Add account security version and notification preferences."""

from alembic import op
import sqlalchemy as sa


revision = "20261111_0006"
down_revision = "20261111_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("auth_version", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column(
            "notify_booking_status", sa.Boolean(), server_default=sa.true(), nullable=False
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "notify_booking_reminder", sa.Boolean(), server_default=sa.true(), nullable=False
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "notify_booking_cancellation",
            sa.Boolean(),
            server_default=sa.true(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "notify_booking_cancellation")
    op.drop_column("users", "notify_booking_reminder")
    op.drop_column("users", "notify_booking_status")
    op.drop_column("users", "auth_version")
