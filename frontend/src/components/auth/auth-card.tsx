import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  prompt: string;
  promptHref: string;
  promptLink: string;
  children: ReactNode;
};

export function AuthCard({ title, prompt, promptHref, promptLink, children }: AuthCardProps) {
  return (
    <div className="rounded-3xl border border-[#E4E7EC] bg-white px-6 py-10 sm:px-[49px] sm:py-[50px]">
      <h2 className="text-[30px] font-bold leading-tight text-ink">{title}</h2>
      <p className="mt-2 text-sm text-[#667085]">
        {prompt} <Link className="ml-1 font-semibold text-brand hover:text-brand-hover" href={promptHref}>{promptLink}</Link>
      </p>
      {children}
    </div>
  );
}

export function SsoSection() {
  return (
    <div className="mt-6">
      <p className="text-xs font-medium text-[#667085]">или продолжить через</p>
      <div className="my-3 h-px bg-[#E4E7EC]" />
      <button className="flex h-12 w-full items-center justify-start rounded-xl border border-[#E4E7EC] bg-white px-5 text-sm font-semibold text-brand transition hover:bg-[#F5F6FF]" type="button">
        Продолжить с университетским SSO
      </button>
    </div>
  );
}
