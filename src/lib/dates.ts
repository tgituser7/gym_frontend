import { DateTime } from 'luxon';

// Today as YYYY-MM-DD in the user's local timezone — for date input default values
export function todayInputDate(): string {
  return DateTime.now().toISODate()!;
}

// Parse a UTC ISO string (from backend) to YYYY-MM-DD for a date input.
// We extract the UTC date as-is because all stored dates represent calendar
// dates (midnight UTC), so the UTC date IS the intended date.
export function isoToInputDate(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).toISODate()!;
}

// Convert YYYY-MM-DD from a date input to a UTC ISO string for the backend.
// Treats the input as a calendar date and stores it as midnight UTC.
export function inputDateToISO(date: string): string {
  return DateTime.fromISO(date, { zone: 'utc' }).toISO()!;
}

// Format a UTC ISO string for display using the user's locale (e.g. "Jan 15, 2024").
// Dates are stored as calendar-date midnight UTC, so we display the UTC date directly.
export function formatDate(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' }).toLocaleString(DateTime.DATE_MED);
}

// How many calendar days from local today until the given UTC ISO date.
// Uses keepLocalTime so "2024-01-15T00:00:00Z" is treated as "Jan 15" in
// the user's local calendar, avoiding off-by-one near midnight.
export function daysUntilDate(iso: string): number {
  const end = DateTime.fromISO(iso, { zone: 'utc' }).setZone('local', { keepLocalTime: true }).startOf('day');
  const today = DateTime.now().startOf('day');
  return Math.ceil(end.diff(today, 'days').days);
}
