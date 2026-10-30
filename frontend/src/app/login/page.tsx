import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requestedPath = Array.isArray(params.next) ? params.next[0] : params.next;
  const redirectTo = getSafeRedirectPath(requestedPath);
  const registerHref = redirectTo === "/dashboard" ? "/register" : `/register?next=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthShell mode="login">
      <AuthCard prompt="Нет аккаунта?" promptHref={registerHref} promptLink="Зарегистрироваться" title="Войти в аккаунт">
        <LoginForm redirectTo={redirectTo} />
      </AuthCard>
    </AuthShell>
  );
}
