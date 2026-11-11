"use client";

import { BellRing, Camera, KeyRound, LogOut, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui";
import { useApiData } from "@/hooks/use-api-data";
import { apiRequest, mediaUrl } from "@/lib/api";
import { formatRole, initials } from "@/lib/format";
import type { User } from "@/lib/types";
import { validateFullName, validatePassword } from "@/lib/validation";

type AuthResponse = { access_token: string };
type Preferences = Pick<
  User,
  "notify_booking_status" | "notify_booking_reminder" | "notify_booking_cancellation"
>;

const defaultPreferences: Preferences = {
  notify_booking_status: true,
  notify_booking_reminder: true,
  notify_booking_cancellation: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const user = useApiData<User>("/auth/me", true);
  const [fullName, setFullName] = useState("");
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [settingsError, setSettingsError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    if (!user.data) return;
    setFullName(user.data.full_name);
    setAvatarUrl(user.data.avatar_url);
    setPreferences({
      notify_booking_status: user.data.notify_booking_status,
      notify_booking_reminder: user.data.notify_booking_reminder,
      notify_booking_cancellation: user.data.notify_booking_cancellation,
    });
  }, [user.data]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError("Выберите изображение JPEG, PNG или WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Размер изображения не должен превышать 5 МБ");
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const updatedUser = await apiRequest<User>("/auth/me/avatar", {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      setAvatarUrl(updatedUser.avatar_url);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Не удалось загрузить изображение");
    } finally {
      setUploadingAvatar(false);
      setAvatarPreview(null);
    }
  }

  async function deleteAvatar() {
    if (uploadingAvatar) return;
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const updatedUser = await apiRequest<User>("/auth/me/avatar", { method: "DELETE" });
      setAvatarUrl(updatedUser.avatar_url);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Не удалось удалить изображение");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateFullName(fullName);
    if (validationError) {
      setSettingsError(validationError);
      return;
    }

    setSavingSettings(true);
    setSettingsError("");
    setSettingsMessage("");
    try {
      const updatedUser = await apiRequest<User>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName, ...preferences }),
      });
      setFullName(updatedUser.full_name);
      setSettingsMessage("Настройки сохранены");
      window.dispatchEvent(new Event("profile-updated"));
      user.reload();
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Не удалось сохранить настройки");
    } finally {
      setSavingSettings(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwords.current) {
      setPasswordError("Введите текущий пароль");
      return;
    }
    const validationError = validatePassword(passwords.next);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("Новые пароли не совпадают");
      return;
    }

    setChangingPassword(true);
    try {
      const result = await apiRequest<AuthResponse>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.next,
        }),
      });
      window.localStorage.setItem("access_token", result.access_token);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordMessage("Пароль изменён. Остальные сеансы завершены");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Не удалось изменить пароль");
    } finally {
      setChangingPassword(false);
    }
  }

  async function logoutAllDevices() {
    if (loggingOutAll) return;
    setLoggingOutAll(true);
    try {
      await apiRequest("/auth/logout-all", { method: "POST", body: JSON.stringify({}) });
    } catch {
      // The local session must still end if the server becomes unavailable.
    } finally {
      window.localStorage.removeItem("access_token");
      router.replace("/login");
      router.refresh();
    }
  }

  if (user.loading) {
    return <main className="min-h-[60vh] flex-1 animate-pulse bg-canvas" />;
  }

  if (!user.data) {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-lg font-bold text-ink">Не удалось загрузить настройки</h1>
          <p className="mt-2 text-sm text-[#667085]">{user.error || "Попробуйте повторить запрос."}</p>
          <Button className="mt-5" onClick={user.reload} variant="secondary">Повторить</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-10 sm:px-8 lg:px-11">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Личный кабинет</p>
        <h1 className="mt-3 text-[30px] font-bold text-ink">Настройки</h1>
        <p className="mt-1 text-sm text-[#667085]">Управляйте профилем, уведомлениями и безопасностью аккаунта.</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={saveSettings}>
        <SettingsCard icon={UserRound} title="Профиль" description="Основная информация вашего аккаунта.">
          <div className="grid gap-5 sm:grid-cols-[140px_1fr_1fr] sm:items-end">
            <div>
              <div className="group relative size-[82px] overflow-hidden rounded-full bg-[#EEF0FF] text-xl font-bold text-brand ring-4 ring-white shadow-[0_4px_16px_rgba(51,70,200,0.12)]">
                <div className="flex size-full items-center justify-center">{avatarPreview || avatarUrl ? <img alt="Аватар профиля" className="size-full object-cover" src={avatarPreview ?? mediaUrl(avatarUrl) ?? undefined} /> : initials(user.data.full_name)}</div>
                <button aria-label="Выбрать аватар" className="absolute inset-0 flex items-center justify-center bg-[#101828]/55 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()} type="button"><Camera className="size-5" /></button>
                {uploadingAvatar && <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[10px] font-bold text-brand">Загрузка…</span>}
              </div>
              <input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={uploadAvatar} ref={avatarInputRef} type="file" />
              {avatarUrl && <button aria-label="Удалить аватар" className="mt-2 text-[#98A2B3] transition hover:text-[#D92D20]" disabled={uploadingAvatar} onClick={deleteAvatar} type="button"><Trash2 className="size-3.5" /></button>}
            </div>
            <AuthField autoComplete="name" id="settings-full-name" label="Имя и фамилия" onChange={(event) => { setFullName(event.target.value); setSettingsError(""); setSettingsMessage(""); }} value={fullName} />
            <ReadonlyField label="Электронная почта" value={user.data.email} />
          </div>
          {avatarError && <p className="mt-3 text-xs font-medium text-[#D94A5C]" role="alert">{avatarError}</p>}
          <div className="mt-5 sm:max-w-[calc(50%_-_10px)]">
            <ReadonlyField label="Роль" value={formatRole(user.data.role)} />
          </div>
        </SettingsCard>

        <SettingsCard icon={BellRing} title="Уведомления" description="Выберите события, о которых хотите получать уведомления.">
          <div className="divide-y divide-[#EAECF0]">
            <PreferenceToggle checked={preferences.notify_booking_status} description="Подтверждение, одобрение или изменение статуса заявки." label="Статус бронирования" onChange={(checked) => setPreferences((current) => ({ ...current, notify_booking_status: checked }))} />
            <PreferenceToggle checked={preferences.notify_booking_reminder} description="Напоминание перед началом забронированного времени." label="Напоминания о брони" onChange={(checked) => setPreferences((current) => ({ ...current, notify_booking_reminder: checked }))} />
            <PreferenceToggle checked={preferences.notify_booking_cancellation} description="Сообщения об отмене или отклонении бронирования." label="Отмена бронирования" onChange={(checked) => setPreferences((current) => ({ ...current, notify_booking_cancellation: checked }))} />
          </div>
        </SettingsCard>

        <div className="flex flex-wrap items-center justify-end gap-4">
          {settingsError && <p className="mr-auto text-xs font-medium text-[#D94A5C]" role="alert">{settingsError}</p>}
          {settingsMessage && <p className="mr-auto text-xs font-medium text-accent" role="status">{settingsMessage}</p>}
          <Button disabled={savingSettings} type="submit">{savingSettings ? "Сохраняем…" : "Сохранить изменения"}</Button>
        </div>
      </form>

      <form className="mt-6" onSubmit={changePassword}>
        <SettingsCard icon={KeyRound} title="Пароль" description="После смены пароля остальные активные сеансы будут завершены.">
          <div className="grid gap-5 md:grid-cols-3">
            <AuthField autoComplete="current-password" id="current-password" label="Текущий пароль" onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} type="password" value={passwords.current} />
            <AuthField autoComplete="new-password" id="new-password" label="Новый пароль" onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} type="password" value={passwords.next} />
            <AuthField autoComplete="new-password" id="confirm-password" label="Повторите пароль" onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))} type="password" value={passwords.confirm} />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-4">
            {passwordError && <p className="mr-auto text-xs font-medium text-[#D94A5C]" role="alert">{passwordError}</p>}
            {passwordMessage && <p className="mr-auto text-xs font-medium text-accent" role="status">{passwordMessage}</p>}
            <Button disabled={changingPassword} variant="secondary" type="submit">{changingPassword ? "Изменяем…" : "Изменить пароль"}</Button>
          </div>
        </SettingsCard>
      </form>

      <section className="mt-6 flex flex-col gap-5 rounded-[18px] border border-[#F4C7C3] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3F2] text-[#D92D20]"><LogOut className="size-5" /></span>
          <div><h2 className="text-base font-bold text-ink">Активные сеансы</h2><p className="mt-1 text-xs leading-5 text-[#667085]">{confirmLogoutAll ? "Все устройства потеряют доступ к аккаунту. Продолжить?" : "Завершить сеансы на всех устройствах, включая текущее."}</p></div>
        </div>
        {confirmLogoutAll ? (
          <div className="flex flex-wrap gap-3">
            <Button disabled={loggingOutAll} onClick={() => setConfirmLogoutAll(false)} variant="secondary">Отмена</Button>
            <Button disabled={loggingOutAll} onClick={logoutAllDevices} variant="destructive">{loggingOutAll ? "Выходим…" : "Подтвердить выход"}</Button>
          </div>
        ) : (
          <Button onClick={() => setConfirmLogoutAll(true)} variant="destructive">Выйти везде</Button>
        )}
      </section>
    </main>
  );
}

function SettingsCard({ icon: Icon, title, description, children }: { icon: typeof UserRound; title: string; description: string; children: ReactNode }) {
  return <section className="rounded-[18px] border border-[#E4E7EC] bg-white p-6"><div className="mb-6 flex gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-brand"><Icon className="size-5" /></span><div><h2 className="text-base font-bold text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p></div></div>{children}</section>;
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return <label className="block text-xs font-semibold text-ink">{label}<input className="mt-2 h-[50px] w-full cursor-not-allowed rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] px-[15px] text-sm font-normal text-[#667085] outline-none" disabled value={value} /></label>;
}

function PreferenceToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-6 py-4 first:pt-0 last:pb-0"><span><span className="block text-[13px] font-semibold text-ink">{label}</span><span className="mt-1 block text-xs leading-5 text-[#667085]">{description}</span></span><input checked={checked} className="peer sr-only" onChange={(event) => onChange(event.target.checked)} type="checkbox" /><span aria-hidden className="relative h-6 w-11 shrink-0 rounded-full bg-[#D0D5DD] transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 peer-focus-visible:ring-offset-2 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" /></label>;
}
