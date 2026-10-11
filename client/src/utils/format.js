export const statusLabel = (s) =>
  ({
    pending: "Pending",
    "in-progress": "In progress",
    completed: "Completed",
  })[s] || s;
export const initials = (name) =>
  (name || "You")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const formatDate = (date) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(date),
  );
