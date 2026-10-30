"""Add favorites and verified space reviews."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20261029_0003"
down_revision = "20261021_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "favorites",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("space_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["space_id"], ["spaces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "space_id"),
        sa.UniqueConstraint("user_id", "space_id", name="uq_favorites_user_space"),
    )
    op.create_table(
        "reviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("space_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("cleanliness", sa.Integer(), nullable=False),
        sa.Column("equipment", sa.Integer(), nullable=False),
        sa.Column("comfort", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("score BETWEEN 1 AND 5", name="ck_reviews_score"),
        sa.CheckConstraint("cleanliness BETWEEN 1 AND 5", name="ck_reviews_cleanliness"),
        sa.CheckConstraint("equipment BETWEEN 1 AND 5", name="ck_reviews_equipment"),
        sa.CheckConstraint("comfort BETWEEN 1 AND 5", name="ck_reviews_comfort"),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["space_id"], ["spaces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])
    op.create_index("ix_reviews_space_id", "reviews", ["space_id"])
    op.create_index("ix_reviews_booking_id", "reviews", ["booking_id"], unique=True)
    op.create_index("ix_reviews_is_published", "reviews", ["is_published"])


def downgrade() -> None:
    op.drop_table("reviews")
    op.drop_table("favorites")
