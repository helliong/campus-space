import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <AuthCard prompt="Нет аккаунта?" promptHref="/register" promptLink="Зарегистрироваться" title="Войти в аккаунт">
        <LoginForm />
      </AuthCard>
    </AuthShell>
  );
}
