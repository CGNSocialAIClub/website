export const LUMA_CALENDAR = "";
// Public subscription feed exposed by the club's Luma calendar (Add iCal Subscription).
export const LUMA_ICAL = "https://api.luma.com/ics/get?entity=calendar&id=cal-as508zTGJbqURMN";
export const LUMA_WEBCAL = LUMA_ICAL.replace('https:', 'webcal:');
export const TIME_ZONE = "Europe/Berlin";
export const dayKey = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
export const hasEnded = (event, now = Date.now()) =>
  new Date(event.end).getTime() <= now;
export const canRegister = (event, now = Date.now()) =>
  !hasEnded(event, now) &&
  event.audience === "public" &&
  event.registrationOpen === true &&
  /^https:\/\/(luma\.com|lu\.ma)\//.test(event.lumaUrl || "");
export const formatDate = (value, locale, options = {}) =>
  new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
    ...options,
  }).format(new Date(value));
export const visibleEvents = (events, locale) =>
  events
    .filter((event) => event.published === true)
    .map((event) => ({ ...event, ...(event[locale] || event.en) }));
export function monthDays(month) {
  const year = month.getUTCFullYear();
  const index = month.getUTCMonth();
  const first = new Date(Date.UTC(year, index, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
  const cells = Math.ceil((offset + count) / 7) * 7;
  return Array.from(
    { length: cells },
    (_, i) => new Date(Date.UTC(year, index, i - offset + 1, 12)),
  );
}

// End instants are exclusive, so an event ending at midnight does not occupy the next day.
export const occursOn = (event, key) =>
  dayKey(event.start) <= key && dayKey(new Date(new Date(event.end).getTime() - 1)) >= key;
export const eventDateLabel = (event, locale) => {
  const end = new Date(new Date(event.end).getTime() - 1);
  return dayKey(event.start) === dayKey(end)
    ? formatDate(event.start, locale)
    : `${formatDate(event.start, locale, {year: undefined})} – ${formatDate(end, locale)}`;
};
export const eventTimeLabel = (event, locale) => {
  if (event.allDay || dayKey(event.start) !== dayKey(new Date(new Date(event.end).getTime() - 1))) return '';
  const options = {day:undefined, month:undefined, year:undefined, hour:'2-digit', minute:'2-digit'};
  return formatDate(event.start, locale, options);
};
