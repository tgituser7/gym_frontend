import { DateTime } from 'luxon';

// Today as YYYY-MM-DD in UTC — for date input default values
export function todayInputDate(): string {
  return DateTime.now().toUTC().toISODate()!;
}

// Parse an ISO string (from backend) to YYYY-MM-DD for a date input
export function isoToInputDate(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).toISODate()!;
}

// Convert YYYY-MM-DD from a date input to a UTC ISO string for the backend
export function inputDateToISO(date: string): string {
  return DateTime.fromISO(date, { zone: 'utc' }).toISO()!;
}

// Format an ISO string for display (e.g., "Jan 15, 2024")
export function formatDate(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).toLocaleString(DateTime.DATE_MED);
}
