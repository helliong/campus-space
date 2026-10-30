import { cookies } from "next/headers";

import { SiteFooter } from "@/components/layout/site-footer";
import { SpaceMapWorkspace } from "@/components/spaces/space-map-workspace";

const REFRESH_COOKIE_NAME = "campus_space_refresh_token";

type SpacesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SpaceMapWorkspace
        authenticated={cookieStore.has(REFRESH_COOKIE_NAME)}
        initialBooking={{
          date: first(params.date),
          pc: first(params.pc),
          resume: first(params.book) === "1",
          room: first(params.room),
          slot: first(params.slot),
        }}
      />
      <SiteFooter bordered />
    </div>
  );
}
