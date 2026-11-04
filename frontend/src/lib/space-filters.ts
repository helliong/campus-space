import type { Space } from "./types";

export type SpaceFilters = {
  building: string;
  floor: number | "";
  onlyAvailable: boolean;
  query: string;
  types: string[];
  amenities: string[];
  minCapacity: string;
  maxCapacity: string;
  approval: string;
};

export function filterSpaces(spaces: Space[], filters: SpaceFilters): Space[] {
  const query = filters.query.trim().toLocaleLowerCase("ru");
  return spaces.filter((space) =>
    (!filters.building || space.building_code === filters.building)
    && (filters.floor === "" || space.floor_number === filters.floor)
    && (!filters.onlyAvailable || space.is_available)
    && (!query || `${space.name} ${space.code} ${space.description ?? ""}`.toLocaleLowerCase("ru").includes(query))
    && (!filters.types.length || filters.types.includes(space.space_type))
    && filters.amenities.every((amenity) => space.amenities.includes(amenity))
    && (!filters.minCapacity || space.capacity >= Number(filters.minCapacity))
    && (!filters.maxCapacity || space.capacity <= Number(filters.maxCapacity))
    && (!filters.approval || space.requires_approval === (filters.approval === "request")),
  );
}
