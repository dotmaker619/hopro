import { DateTime } from "luxon";

// export default function(date) {
//   return new Date(date).toLocaleString("en-IN", {
//     hour12: true,
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

export default function(date) {
  if (!date) return "";
  let givenDate = DateTime.fromISO(date, { setZone: true, zone: "utc" }).toLocaleString({
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return givenDate;
}
