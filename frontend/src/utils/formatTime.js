// utils/formatTime.js
export function formatTime(timeStr) {
  if (!timeStr) return "—";

  // browser-readable string or 'HH:mm'
  const [h, m] = timeStr.split(":");

  const date = new Date();
  date.setHours(h, m, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
