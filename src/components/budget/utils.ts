// ——— utility functions ————————————————————————————————————————
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const monthKey = (y: number, m: number) => `${y}-${pad2(m + 1)}`; // m is 0-based
export const makeId = () =>
  (typeof crypto !== "undefined" && (crypto as any).randomUUID
    ? (crypto as any).randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 Sun – 6 Sat
}

export function monStartOffset(year: number, month: number) {
  // translate to Monday-first offset (0=Mon..6=Sun)
  const d = new Date(year, month, 1).getDay(); // 0 Sun..6 Sat
  return (d + 6) % 7;
}

export function weekCount(year: number, month: number) {
  const n = daysInMonth(year, month);
  const off = monStartOffset(year, month);
  return Math.ceil((off + n) / 7);
}

export function weekIndexOf(year: number, month: number, day: number) {
  const off = monStartOffset(year, month);
  return Math.floor((off + (day - 1)) / 7); // 0-based week index within month
}

export function ymd(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// ——— runtime tests ————————————————————————————————————————
(function runTests() {
  try {
    console.assert(pad2(3) === "03", "pad2 should pad single digits");
    console.assert(monthKey(2025, 8) === "2025-09", "monthKey should be YYYY-MM for 0-based month");
    console.assert(daysInMonth(2024, 1) === 29, "2024 Feb should have 29 days");
    console.assert(firstWeekday(2025, 8) === 1, "Sept 1, 2025 is Monday => day 1");
    console.assert(
      weekIndexOf(2025, 8, 1) === 0 && weekIndexOf(2025, 8, 8) === 1,
      "week index math"
    );
  } catch (e) {
    console.warn("Self-tests failed:", e);
  }
})();