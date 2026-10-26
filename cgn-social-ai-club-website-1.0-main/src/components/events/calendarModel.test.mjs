import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCalendar, resolveMonth, adjacentEventMonth, shiftMonth } from './calendarModel.mjs';
const event = (id, start, end) => ({ id, start:`${start}T00:00:00+02:00`, end:`${end}T00:00:00+02:00` });
const events = [event('first','2026-04-21','2026-04-22'),event('hack','2026-06-27','2026-06-29'),event('last','2026-10-08','2026-10-09')];
test('months stay mounted from first event through one month beyond today, including empty months',()=>{
 const calendar=buildCalendar(events,'2026-10-20');
 assert.equal(calendar.min,'2026-04');assert.equal(calendar.max,'2026-11');assert.equal(calendar.months.length,8);
 assert.equal(calendar.months[1].events.length,0);
 for(let i=1;i<calendar.months.length;i++)assert.equal(calendar.months[i].offset,calendar.months[i-1].offset+calendar.months[i-1].height);
});
test('navigation targets only event months while intermediate empty months remain in the track',()=>{
 const {months}=buildCalendar(events,'2026-10-20');
 assert.equal(adjacentEventMonth(months,'2026-06',1).key,'2026-10');
 assert.equal(adjacentEventMonth(months,'2026-06',-1).key,'2026-04');
 assert.equal(adjacentEventMonth(months,'2026-10',1),undefined);
});
test('each month has complete weeks, muted outside days without duplicate events, and compact empty rows',()=>{
 const calendar=buildCalendar(events,'2026-10-20');
 for(const month of calendar.months){
  assert.ok(month.weeks.every(week=>week.days.length===7));
  assert.ok(month.weeks.flatMap(week=>week.days).filter(day=>day.outside).every(day=>!day.events.length));
  assert.equal(month.height,month.weeks.reduce((sum,week)=>sum+week.height,0));
  assert.ok(month.weeks.filter(week=>week.days.every(day=>!day.events.length)).every(week=>week.height===32));
 }
 const june=calendar.months.find(month=>month.key==='2026-06');
 assert.deepEqual(june.weeks.flatMap(week=>week.days).filter(day=>day.events.length).map(day=>day.key),['2026-06-27','2026-06-28']);
});
test('invalid and out-of-range links resolve safely, including empty datasets and year boundaries',()=>{
 const calendar=buildCalendar(events,'2026-10-20');
 assert.equal(resolveMonth(calendar,'2025-12','2026-10-20').key,'2026-04');
 assert.equal(resolveMonth(calendar,'2029-01','2026-10-20').key,'2026-11');
 assert.equal(resolveMonth(calendar,'2026-13','2026-10-20').key,'2026-10');
 assert.equal(buildCalendar([],'2026-12-10').max,'2027-01');
 assert.equal(shiftMonth('2026-01',-1),'2025-12');
});

test('multi-day events produce one spanning box per week and overlapping events use separate lanes',()=>{
 const calendar=buildCalendar([...events,event('overlap','2026-06-28','2026-06-29')],'2026-10-20');
 const june=calendar.months.find(month=>month.key==='2026-06');
 const segments=june.weeks.flatMap(week=>week.segments);
 const hack=segments.filter(segment=>segment.event.id==='hack');
 assert.equal(hack.length,1);assert.equal(hack[0].column,5);assert.equal(hack[0].span,2);
 assert.notEqual(hack[0].lane,segments.find(segment=>segment.event.id==='overlap').lane);
});
