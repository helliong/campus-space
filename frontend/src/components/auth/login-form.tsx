"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FocusEvent, type FormEvent } from "react";

import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { validatePassword, validateUniversityEmail } from "@/lib/validation";

import { AuthField } from "./auth-field";
import { SsoSection } from "./auth-card";

type LoginValues = { email: string; password: string };
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const validators = { email: validateUniversityEmail, password: validatePassword };
type AuthResponse = { access_token: string };

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field: keyof LoginValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess(false);
    setSubmitError("");
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validators[field](value) }));
  };

  const blur = (field: keyof LoginValues) => (event: FocusEvent<HTMLInputElement>) => {
    setErrors((current) => ({ ...current, [field]: validators[field](event.target.value) }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: LoginErrors = {
      email: validateUniversityEmail(values.email),
      password: validatePassword(values.password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    try {
      const result = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(values) });
      window.localStorage.setItem("access_token", result.access_token);
      setSuccess(true);
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <>
      <form className="mt-10" noValidate onSubmit={submit}>
        <div className="space-y-4">
          <AuthField autoComplete="email" error={errors.email} id="email" label="Университетская почта" name="email" onBlur={blur("email")} onChange={(event) => update("email", event.target.value)} placeholder="name@university.ru" type="email" value={values.email} />
          <AuthField autoComplete="current-password" error={errors.password} id="password" label="Пароль" name="password" onBlur={blur("password")} onChange={(event) => update("password", event.target.value)} placeholder="Введите пароль" type="password" value={values.password} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-3 text-xs text-[#667085]"><input className="size-[18px] accent-brand" name="remember" type="checkbox" />Запомнить меня</label>
          <Link className="text-xs font-semibold text-brand hover:text-brand-hover" href="/forgot-password">Забыли пароль?</Link>
        </div>
        <Button className="mt-8 h-12 justify-start px-5" fullWidth type="submit">Войти</Button>
        {success && <p className="mt-3 rounded-xl bg-[#E8F8F5] px-4 py-3 text-xs font-medium text-[#168C7F]" role="status">Данные заполнены корректно. Авторизация будет подключена к API.</p>}
      </form>
      {submitError && <p className="mt-3 text-xs font-medium text-[#D94A5C]" role="alert">{submitError}</p>}
      <div className="mt-7"><SsoSection /></div>
    </>
  );
}
