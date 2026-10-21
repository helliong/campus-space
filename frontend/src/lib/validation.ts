export function validateFullName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "Укажите имя и фамилию";
  if (normalized.length < 5) return "Имя и фамилия слишком короткие";
  if (!/^[А-ЯЁA-Z][А-ЯЁA-Zа-яёa-z-]+(?:\s+[А-ЯЁA-Z][А-ЯЁA-Zа-яёa-z-]+)+$/.test(normalized)) {
    return "Введите имя и фамилию через пробел";
  }
  return "";
}

export function validateUniversityEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return "Укажите университетскую почту";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Введите корректный адрес почты";
  if (!email.endsWith("@university.ru")) return "Используйте почту в домене @university.ru";
  return "";
}

export function validatePassword(value: string) {
  if (!value) return "Введите пароль";
  if (value.length < 8) return "Пароль должен содержать минимум 8 символов";
  return "";
}
