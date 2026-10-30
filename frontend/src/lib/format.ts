const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const dateWithYearFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "long" });
const timeFormatter = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

export function formatDate(value: string, withYear = false) {
  return (withYear ? dateWithYearFormatter : dateFormatter).format(new Date(value));
}

export function formatWeekday(value: string) {
  const result = weekdayFormatter.format(new Date(value));
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function formatTimeRange(start: string, end: string) {
  return `${timeFormatter.format(new Date(start))}–${timeFormatter.format(new Date(end))}`;
}

export function formatRole(role: string) {
  return { student: "Студент", teacher: "Преподаватель", admin: "Администратор" }[role] ?? role;
}

export function initials(fullName: string) {
  return fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

export function spaceTypeLabel(type: string) {
  return {
    classroom: "Аудитория",
    meeting_room: "Переговорная",
    coworking: "Коворкинг",
    laboratory: "Лаборатория",
    computer_lab: "Компьютерный класс",
  }[type] ?? type;
}
