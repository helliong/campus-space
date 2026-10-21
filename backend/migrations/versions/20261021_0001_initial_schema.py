"""Create the initial CampusSpace schema."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20261021_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="student"),
        sa.Column("faculty", sa.String(200)),
        sa.Column("group_name", sa.String(100)),
        sa.Column("phone", sa.String(32)),
        sa.Column("avatar_url", sa.Text()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("role IN ('student', 'teacher', 'admin')", name="ck_users_role"),
    )

    op.create_table(
        "buildings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(32), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("address", sa.String(300)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_table(
        "floors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("plan_image_url", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["building_id"], ["buildings.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("building_id", "number", name="uq_floors_building_number"),
    )
    op.create_table(
        "spaces",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("floor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("space_type", sa.String(32), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("access_policy", sa.String(32), nullable=False, server_default="public"),
        sa.Column("requires_approval", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("image_url", sa.Text()),
        sa.Column("map_x", sa.Numeric(8, 2)),
        sa.Column("map_y", sa.Numeric(8, 2)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("capacity > 0", name="ck_spaces_capacity_positive"),
        sa.CheckConstraint("space_type IN ('classroom', 'meeting_room', 'coworking', 'laboratory', 'computer_lab')", name="ck_spaces_type"),
        sa.CheckConstraint("access_policy IN ('public', 'restricted')", name="ck_spaces_access_policy"),
        sa.ForeignKeyConstraint(["floor_id"], ["floors.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("floor_id", "code", name="uq_spaces_floor_code"),
    )
    op.create_index("ix_spaces_floor_id", "spaces", ["floor_id"])
    op.create_table(
        "workplaces",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("space_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("kind", sa.String(32), nullable=False, server_default="desk"),
        sa.Column("has_computer", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("map_x", sa.Numeric(8, 2)),
        sa.Column("map_y", sa.Numeric(8, 2)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("kind IN ('desk', 'computer_seat')", name="ck_workplaces_kind"),
        sa.ForeignKeyConstraint(["space_id"], ["spaces.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("space_id", "code", name="uq_workplaces_space_code"),
    )
    op.create_index("ix_workplaces_space_id", "workplaces", ["space_id"])
    op.create_table(
        "amenities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(64), nullable=False, unique=True),
        sa.Column("name", sa.String(100), nullable=False),
    )
    op.create_table(
        "space_amenities",
        sa.Column("space_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("amenity_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.ForeignKeyConstraint(["space_id"], ["spaces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["amenity_id"], ["amenities.id"], ondelete="CASCADE"),
    )
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("space_id", postgresql.UUID(as_uuid=True)),
        sa.Column("workplace_id", postgresql.UUID(as_uuid=True)),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("purpose", sa.Text()),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("admin_comment", sa.Text()),
        sa.Column("cancelled_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("starts_at < ends_at", name="ck_bookings_valid_period"),
        sa.CheckConstraint("status IN ('pending', 'confirmed', 'rejected', 'cancelled')", name="ck_bookings_status"),
        sa.CheckConstraint("(space_id IS NOT NULL AND workplace_id IS NULL) OR (space_id IS NULL AND workplace_id IS NOT NULL)", name="ck_bookings_exactly_one_target"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["space_id"], ["spaces.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["workplace_id"], ["workplaces.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_bookings_user_id", "bookings", ["user_id"])
    op.create_index("ix_bookings_space_id", "bookings", ["space_id"])
    op.create_index("ix_bookings_workplace_id", "bookings", ["workplace_id"])
    op.create_index("ix_bookings_starts_at", "bookings", ["starts_at"])
    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.execute("""
        ALTER TABLE bookings ADD CONSTRAINT exclude_overlapping_space_bookings
        EXCLUDE USING gist (space_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
        WHERE (status IN ('pending', 'confirmed') AND space_id IS NOT NULL)
    """)
    op.execute("""
        ALTER TABLE bookings ADD CONSTRAINT exclude_overlapping_workplace_bookings
        EXCLUDE USING gist (workplace_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
        WHERE (status IN ('pending', 'confirmed') AND workplace_id IS NOT NULL)
    """)


def downgrade() -> None:
    op.drop_table("bookings")
    op.drop_table("space_amenities")
    op.drop_table("amenities")
    op.drop_table("workplaces")
    op.drop_table("spaces")
    op.drop_table("floors")
    op.drop_table("buildings")
    op.drop_table("users")
