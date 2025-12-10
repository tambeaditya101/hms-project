export function formatDate(raw, locale = "en-IN") {
  if (!raw) return "—";

  const date = new Date(raw);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
