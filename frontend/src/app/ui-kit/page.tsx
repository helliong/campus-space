import type { ReactNode } from "react";

import {
  AvailabilityBadge,
  Button,
  FilterChip,
  Logo,
  MapDesk,
  MapPcSeat,
  MapRoom,
  SelectField,
  SpaceCard,
  TimeSlot,
  type AvailabilityStatus,
} from "@/components/ui";

const space = {
  id: "k-214",
  name: "К-214",
  type: "Коворкинг",
  floor: 2,
  seats: 12,
  computers: 6,
  features: ["Проектор"],
  rating: 4.8,
  review: "Комфортно для команд",
  status: "available" as const,
};

const statuses: AvailabilityStatus[] = ["available", "partial", "busy", "pending", "restricted"];

export default function UiKitPage() {
  return (
    <main className="min-h-[100dvh] bg-canvas px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div><h1 className="text-3xl font-bold">CampusSpace</h1><p className="mt-2 text-[#667085]">UI Kit · v1.0</p></div>
          <Logo />
        </div>
        <Showcase title="Buttons">
          <Button>Забронировать</Button><Button variant="secondary">Забронировать</Button><Button variant="destructive">Забронировать</Button>
        </Showcase>
        <Showcase title="Selectors & filters">
          <SelectField aria-label="Дата"><option value="today">Сегодня</option></SelectField><FilterChip>ПК</FilterChip><FilterChip selected>Проектор</FilterChip><FilterChip>До 10 мест</FilterChip>
        </Showcase>
        <Showcase title="Availability">
          {statuses.map((status) => <AvailabilityBadge key={status} status={status} />)}
        </Showcase>
        <Showcase title="Calendar slots">
          <TimeSlot>14:00</TimeSlot><TimeSlot state="selected">14:30</TimeSlot><TimeSlot state="busy">15:00</TimeSlot><TimeSlot state="pending">15:30</TimeSlot>
        </Showcase>
        <Showcase title="Floor plan elements">
          <MapRoom meta="12 мест · ПК" name="К-214" /><MapDesk /><MapPcSeat />
        </Showcase>
        <Showcase title="Space cards">
          <SpaceCard space={space} /><SpaceCard space={space} variant="booking" />
        </Showcase>
      </div>
    </main>
  );
}

function Showcase({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-[11px] font-bold uppercase text-[#667085]">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}
