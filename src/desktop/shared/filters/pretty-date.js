import { DateTime } from "luxon";

export default function (date) {
    if (!date) return "";
    let givenDate = new DateTime.fromISO(date);
    let today = new DateTime.local();
    if (today.diff(givenDate, "days").days < 7)
        return givenDate.toRelative({ base: today });
    return givenDate.toFormat('DDDD');
}