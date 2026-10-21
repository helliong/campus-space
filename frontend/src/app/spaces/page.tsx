import { SiteFooter } from "@/components/layout/site-footer";
import { SpaceMapWorkspace } from "@/components/spaces/space-map-workspace";

export default function SpacesPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SpaceMapWorkspace />
      <SiteFooter bordered />
    </div>
  );
}
