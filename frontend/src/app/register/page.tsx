import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <AuthCard prompt="Уже пользуетесь CampusSpace?" promptHref="/login" promptLink="Войти" title="Создать аккаунт">
        <RegisterForm />
      </AuthCard>
    </AuthShell>
  );
}
