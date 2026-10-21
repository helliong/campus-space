"use client";

import Link from "next/link";
import { useState, type FocusEvent, type FormEvent } from "react";

import { Button } from "@/components/ui";
import { validatePassword, validateUniversityEmail } from "@/lib/validation";

import { AuthField } from "./auth-field";
import { SsoSection } from "./auth-card";

type LoginValues = { email: string; password: string };
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const validators = { email: validateUniversityEmail, password: validatePassword };

export function LoginForm() {
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [success, setSuccess] = useState(false);

  const update = (field: keyof LoginValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess(false);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validators[field](value) }));
  };

  const blur = (field: keyof LoginValues) => (event: FocusEvent<HTMLInputElement>) => {
    setErrors((current) => ({ ...current, [field]: validators[field](event.target.value) }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: LoginErrors = {
      email: validateUniversityEmail(values.email),
      password: validatePassword(values.password),
    };
    setErrors(nextErrors);
    const valid = !Object.values(nextErrors).some(Boolean);
    setSuccess(valid);
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
      <div className="mt-7"><SsoSection /></div>
    </>
  );
}
