import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

export function toDateKey(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function parseDateKey(dateKey: string): Date {
  return dayjs(dateKey).startOf("day").toDate();
}

export function addDays(date: Date, amount: number): Date {
  return dayjs(date).add(amount, "day").toDate();
}

export function daysBetween(start: Date, end: Date): number {
  return dayjs(end).startOf("day").diff(dayjs(start).startOf("day"), "day");
}

export function getMonthDates(year: number, monthIndex: number): Date[] {
  const firstDay = dayjs().year(year).month(monthIndex).date(1).startOf("day");
  const daysInMonth = firstDay.daysInMonth();

  return Array.from({ length: daysInMonth }, (_, index) =>
    firstDay.add(index, "day").toDate(),
  );
}

export function getCalendarGridDates(year: number, monthIndex: number): Date[] {
  const monthDates = getMonthDates(year, monthIndex);
  const first = dayjs(monthDates[0]);
  const last = dayjs(monthDates[monthDates.length - 1]);
  const leadingDays = first.day();
  const trailingDays = 6 - last.day();

  const grid: Date[] = [];
  for (let i = leadingDays; i > 0; i -= 1) {
    grid.push(first.subtract(i, "day").toDate());
  }
  grid.push(...monthDates);
  for (let i = 1; i <= trailingDays; i += 1) {
    grid.push(last.add(i, "day").toDate());
  }

  return grid;
}

export function formatMonthLabel(year: number, monthIndex: number): string {
  return dayjs().year(year).month(monthIndex).date(1).format("MMMM YYYY");
}

export function formatShortDate(dateKey: string): string {
  return dayjs(dateKey).format("MMM D");
}

export function getMonthKey(dateKey: string): string {
  return dayjs(dateKey).format("YYYY-MM");
}

export function getWeekKey(date: Date): string {
  return dayjs(date).startOf("week").format("YYYY-MM-DD");
}

export function getWeekOfYear(dateKey: string): number {
  return dayjs(dateKey).week();
}

export function getTimeRangeHours(start: string, end: string): number {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

export function formatDuration(totalHours: number): string {
  const totalMinutes = Math.max(0, Math.round(totalHours * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingAfterDays = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0 || days > 0 || minutes === 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ");
}

export function isToday(dateKey: string): boolean {
  return dayjs().format("YYYY-MM-DD") === dateKey;
}
