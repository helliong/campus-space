"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FocusEvent, type FormEvent } from "react";

import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api";
import { validateFullName, validatePassword, validateUniversityEmail } from "@/lib/validation";

import { AuthField } from "./auth-field";
import { SsoSection } from "./auth-card";

type RegisterValues = { fullName: string; email: string; password: string; role: string; terms: boolean };
type Field = "fullName" | "email" | "password";
type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;
const validators = { fullName: validateFullName, email: validateUniversityEmail, password: validatePassword };
type AuthResponse = { access_token: string };

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>({ fullName: "", email: "", password: "", role: "student", terms: false });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess(false);
    setSubmitError("");
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validators[field](value) }));
  };

  const blur = (field: Field) => (event: FocusEvent<HTMLInputElement>) => setErrors((current) => ({ ...current, [field]: validators[field](event.target.value) }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: RegisterErrors = {
      fullName: validateFullName(values.fullName), email: validateUniversityEmail(values.email), password: validatePassword(values.password), terms: values.terms ? "" : "Необходимо принять правила и политику конфиденциальности",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    try {
      const result = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name: values.fullName, email: values.email, password: values.password, role: values.role }),
      });
      window.localStorage.setItem("access_token", result.access_token);
      setSuccess(true);
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <>
      <form className="mt-8" noValidate onSubmit={submit}>
        <div className="space-y-4">
          <AuthField autoComplete="name" error={errors.fullName} id="full-name" label="Имя и фамилия" name="fullName" onBlur={blur("fullName")} onChange={(event) => update("fullName", event.target.value)} placeholder="Например, Анна Иванова" value={values.fullName} />
          <AuthField autoComplete="email" error={errors.email} id="email" label="Университетская почта" name="email" onBlur={blur("email")} onChange={(event) => update("email", event.target.value)} placeholder="name@university.ru" type="email" value={values.email} />
          <AuthField autoComplete="new-password" error={errors.password} id="password" label="Пароль" name="password" onBlur={blur("password")} onChange={(event) => update("password", event.target.value)} placeholder="Не менее 8 символов" type="password" value={values.password} />
          <label className="block text-xs font-semibold text-ink" htmlFor="role">Роль<select className="mt-2 h-[50px] w-full rounded-xl border border-[#E4E7EC] bg-white px-[15px] text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" id="role" name="role" onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))} value={values.role}><option value="student">Студент</option><option value="teacher">Преподаватель</option></select></label>
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs leading-[1.45] text-[#667085]">
          <input
            aria-describedby={errors.terms ? "terms-error" : undefined}
            aria-invalid={Boolean(errors.terms)}
            checked={values.terms}
            className="mt-0.5 size-[18px] shrink-0 accent-brand"
            name="terms"
            onChange={(event) => {
              setValues((current) => ({ ...current, terms: event.target.checked }));
              if (errors.terms) setErrors((current) => ({ ...current, terms: event.target.checked ? "" : current.terms }));
            }}
            type="checkbox"
          />
          <span>
            Я принимаю{" "}
            <Link
              className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand-hover hover:decoration-brand"
              href="/booking-rules"
              target="_blank"
            >
              правила бронирования
            </Link>{" "}
            и{" "}
            <Link
              className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand-hover hover:decoration-brand"
              href="/privacy"
              target="_blank"
            >
              политику конфиденциальности
            </Link>
          </span>
        </label>
        {errors.terms && <p className="mt-1.5 text-[11px] font-medium text-[#D94A5C]" id="terms-error" role="alert">{errors.terms}</p>}
        <Button className="mt-7 h-12 justify-start px-5" fullWidth type="submit">Создать аккаунт</Button>
        {success && <p className="mt-3 rounded-xl bg-[#E8F8F5] px-4 py-3 text-xs font-medium text-[#168C7F]" role="status">Данные заполнены корректно. Регистрация будет подключена к API.</p>}
      </form>
      {submitError && <p className="mt-3 text-xs font-medium text-[#D94A5C]" role="alert">{submitError}</p>}
      <SsoSection />
    </>
  );
}
