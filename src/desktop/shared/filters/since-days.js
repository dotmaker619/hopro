import { DateTime } from "luxon";

export default function(date) {
  if (!date) return "";
  let givenDate = new DateTime.fromISO(date);
  let today = new DateTime.local();
  return givenDate.toRelative({ base: today });
}
