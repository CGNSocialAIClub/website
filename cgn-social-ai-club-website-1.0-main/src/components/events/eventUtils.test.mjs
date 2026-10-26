import test from "node:test";
import assert from "node:assert/strict";
import {
  canRegister,
  dayKey,
  hasEnded,
  monthDays,
  visibleEvents,
} from "./eventUtils.js";
const now = Date.parse("2026-10-15T12:00:00Z");
const future = {
  published: true,
  audience: "public",
  registrationOpen: true,
  start: "2026-10-16T18:00:00+02:00",
  end: "2026-10-16T20:00:00+02:00",
  lumaUrl: "https://luma.com/example",
  en: { title: "English" },
  de: { title: "Deutsch" },
};
test("only explicitly published entries are displayed, with locale fallback", () => {
  assert.equal(
    visibleEvents(
      [
        future,
        { ...future, published: false },
        { ...future, published: undefined },
      ],
      "de",
    ).length,
    1,
  );
  assert.equal(visibleEvents([future], "fr")[0].title, "English");
});
test("registration requires a public, open, unended event and a Luma URL", () => {
  assert.equal(canRegister(future, now), true);
  for (const override of [
    { audience: "internal" },
    { registrationOpen: false },
    { end: "2026-10-14T20:00:00+02:00" },
    { lumaUrl: "https://luma.com.evil.test/event" },
    { lumaUrl: "javascript:alert(1)" },
  ])
    assert.equal(canRegister({ ...future, ...override }, now), false);
  assert.equal(hasEnded(future, Date.parse(future.end)), true);
  assert.equal(hasEnded(future, Date.parse(future.start)), false);
});
test("Berlin calendar dates handle midnight and daylight saving", () => {
  assert.equal(dayKey("2026-10-15T22:30:00Z"), "2026-10-16");
  assert.equal(dayKey("2026-12-15T22:30:00Z"), "2026-12-15");
});
test("calendar has full Monday-first weeks across leap years and year boundaries", () => {
  for (const value of ["2026-10-01", "2028-02-01", "2027-01-01"]) {
    const month = new Date(`${value}T12:00:00Z`),
      days = monthDays(month);
    assert.equal(days.length % 7, 0);
    assert.equal(days[0].getUTCDay(), 1);
    assert.equal(days.at(-1).getUTCDay(), 0);
    const actual = days.filter(
      (day) => day.getUTCMonth() === month.getUTCMonth(),
    );
    assert.equal(
      actual.length,
      new Date(
        Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
      ).getUTCDate(),
    );
  }
});

test('multi-day events occupy every day and respect an exclusive midnight end', async()=>{
 const {occursOn,eventDateLabel,eventTimeLabel}=await import('./eventUtils.js');
 const hack={start:'2026-06-27T09:00:00+02:00',end:'2026-06-28T16:00:00+02:00'};
 assert.equal(occursOn(hack,'2026-06-27'),true);
 assert.equal(occursOn(hack,'2026-06-28'),true);
 assert.equal(occursOn(hack,'2026-06-29'),false);
 const day={start:'2026-05-15T00:00:00+02:00',end:'2026-05-16T00:00:00+02:00',allDay:true};
 assert.equal(occursOn(day,'2026-05-16'),false);
 assert.equal(eventTimeLabel(day,'de'),'');
 assert.equal(eventDateLabel(day,'en'),'15 May 2026');
});

test('archive entries have unique IDs, valid dates and existing local images', async()=>{
 const {readFileSync,existsSync}=await import('node:fs');
 const events=JSON.parse(readFileSync(new URL('../../data/events.json',import.meta.url),'utf8'));
 assert.equal(new Set(events.map(e=>e.id)).size,events.length);
 for(const event of events){
  assert.ok(Date.parse(event.end)>Date.parse(event.start),event.id);
  for(const lang of ['en','de']) assert.ok(event[lang]?.title && event[lang]?.content,event.id);
  for(const src of [event.image,...event.gallery.map(image=>image.src)]) assert.ok(existsSync(new URL(`../../../public${src}`,import.meta.url)),src);
 }
});
