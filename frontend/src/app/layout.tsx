import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CookieBanner } from "@/components/ui";

import "./globals.css";

export const metadata: Metadata = {
  title: "CampusSpace",
  description: "Бронирование учебных пространств университета",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
