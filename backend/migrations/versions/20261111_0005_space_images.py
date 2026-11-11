"""Add ordered image galleries for campus spaces."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20261111_0005"
down_revision = "20261029_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "space_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("space_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("alt_text", sa.String(length=300), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "sort_order >= 0", name="ck_space_images_sort_order_nonnegative"
        ),
        sa.ForeignKeyConstraint(["space_id"], ["spaces.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("space_id", "sort_order", name="uq_space_images_space_order"),
    )
    op.create_index("ix_space_images_space_id", "space_images", ["space_id"])


def downgrade() -> None:
    op.drop_index("ix_space_images_space_id", table_name="space_images")
    op.drop_table("space_images")
