import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function Logo({ className, href = "/", compact = false }: LogoProps) {
  return (
    <Link
      aria-label="CampusSpace — на главную"
      className={cn("inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40", className)}
      href={href}
    >
      <Image alt="" height={44} priority src="/brand/campus-mark.png" width={44} />
      {!compact && (
        <span className="text-[23px] leading-none tracking-[-0.03em] text-ink">
          <strong className="font-bold">Campus</strong>
          <span className="font-normal">Space</span>
        </span>
      )}
    </Link>
  );
}
