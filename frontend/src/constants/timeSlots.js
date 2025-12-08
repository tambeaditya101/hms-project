// Generates time slots between 9AM–6PM at 30-minute intervals
export const TIME_SLOTS = (() => {
  const slots = [];
  let start = 9 * 60; // 9:00 AM
  let end = 18 * 60; // 6:00 PM

  while (start <= end) {
    const hours = Math.floor(start / 60);
    const minutes = start % 60;

    // 24-hour format stored in DB
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;

    // 12-hour formatted label for UI
    const ampm = hours >= 12 ? "PM" : "AM";
    const hr12 = hours % 12 === 0 ? 12 : hours % 12;
    const label = `${hr12}:${minutes === 0 ? "00" : minutes} ${ampm}`;

    slots.push({ value, label });
    start += 30; // 30-minute increment
  }

  return slots;
})();
