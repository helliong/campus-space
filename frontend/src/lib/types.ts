export type User = {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "teacher" | "admin";
  faculty: string | null;
  group_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Workplace = {
  id: string;
  code: string;
  kind: string;
  has_computer: boolean;
  map_x: number | null;
  map_y: number | null;
  is_available: boolean;
};

export type Space = {
  id: string;
  code: string;
  name: string;
  space_type: string;
  capacity: number;
  description: string | null;
  access_policy: string;
  requires_approval: boolean;
  image_url: string | null;
  map_x: number | null;
  map_y: number | null;
  building_code: string;
  building_name: string;
  floor_number: number;
  amenities: string[];
  workplaces: Workplace[];
  rating_average: number | null;
  review_count: number;
  is_available: boolean;
};

export type Booking = {
  id: string;
  starts_at: string;
  ends_at: string;
  purpose: string | null;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  admin_comment: string | null;
  cancelled_at: string | null;
  created_at: string;
  space_id: string;
  space_code: string;
  space_name: string;
  space_type: string;
  workplace_id: string | null;
  workplace_code: string | null;
  building_code: string;
  floor_number: number;
  can_review: boolean;
  has_review: boolean;
};

export type Review = {
  id: string;
  booking_id: string;
  space_id: string;
  space_code: string;
  space_name: string;
  author_name: string;
  author_role: string;
  score: number;
  cleanliness: number;
  equipment: number;
  comfort: number;
  text: string;
  created_at: string;
  verified_booking: boolean;
};

export type ReviewCollection = {
  metrics: {
    average: number | null;
    cleanliness: number | null;
    equipment: number | null;
    comfort: number | null;
    total: number;
    distribution: Record<string, number>;
  };
  items: Review[];
};
