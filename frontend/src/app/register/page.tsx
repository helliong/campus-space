import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getSafeRedirectPath } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const requestedPath = Array.isArray(params.next) ? params.next[0] : params.next;
  const redirectTo = getSafeRedirectPath(requestedPath);
  const loginHref = redirectTo === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthShell mode="register">
      <AuthCard prompt="Уже пользуетесь CampusSpace?" promptHref={loginHref} promptLink="Войти" title="Создать аккаунт">
        <RegisterForm redirectTo={redirectTo} />
      </AuthCard>
    </AuthShell>
  );
}
