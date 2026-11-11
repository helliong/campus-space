export function validateFullName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "Укажите имя и фамилию";
  if (normalized.length < 5) return "Имя и фамилия слишком короткие";
  if (!/^[А-ЯЁA-Z][А-ЯЁA-Zа-яёa-z-]+(?:\s+[А-ЯЁA-Z][А-ЯЁA-Zа-яёa-z-]+)+$/.test(normalized)) {
    return "Введите имя и фамилию через пробел";
  }
  return "";
}

export function validateEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email) return "Укажите электронную почту";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Введите корректный адрес почты";
  return "";
}

export function validatePassword(value: string) {
  if (!value) return "Введите пароль";
  if (value.length < 8) return "Пароль должен содержать минимум 8 символов";
  return "";
}
