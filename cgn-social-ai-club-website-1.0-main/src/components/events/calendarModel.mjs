import { dayKey, monthDays } from './eventUtils.js';

export function shiftMonth(key, amount) {
  const date = new Date(`${key}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}

// One source of truth for month geometry, event occupancy and navigation.
export function buildCalendar(events, today, laneHeight = 97, columnWidth = 0, weekHeights = {}) {
  const indexed = events.map(event => ({
    event, start: dayKey(event.start),
    end: dayKey(new Date(new Date(event.end).getTime() - 1)),
  }));
  const current = today.slice(0, 7);
  const first = indexed.map(item => item.start.slice(0, 7)).sort()[0] || current;
  const min = first < current ? first : current;
  const max = shiftMonth(current, 1);
  const months = [];
  let offset = 0;
  for (let key = min; key <= max; key = shiftMonth(key, 1)) {
    const days = monthDays(new Date(`${key}-01T12:00:00Z`)).map(date => {
      const day = dayKey(date);
      const outside = day.slice(0, 7) !== key;
      return { key: day, number: date.getUTCDate(), outside,
        events: outside ? [] : indexed.filter(item => item.start <= day && item.end >= day),
      };
    });
    const weeks = [];
    for (let index = 0; index < days.length; index += 7) {
      const cells = days.slice(index, index + 7);
      const unique = new Map(cells.flatMap(day => day.events).map(item => [item.event.id, item]));
      const segments = [...unique.values()].map(item => {
        const columns = cells.flatMap((day, column) => day.events.some(entry => entry.event.id === item.event.id) ? [column] : []);
        return { ...item, column: columns[0], span: columns.at(-1) - columns[0] + 1 };
      }).sort((a,b) => a.column - b.column || b.span - a.span || a.event.id.localeCompare(b.event.id));
      const lanes = [];
      for (const segment of segments) {
        let lane = lanes.findIndex(end => end < segment.column);
        if (lane < 0) lane = lanes.length;
        lanes[lane] = segment.column + segment.span - 1;
        segment.lane = lane;
      }
      const widestSpan=Math.max(1,...segments.map(segment=>segment.span));
      const weekLaneHeight=Math.max(laneHeight,Math.min(97,Math.ceil(laneHeight+columnWidth*(widestSpan-1))));
      weeks.push({ days: cells, segments, height: lanes.length ? (weekHeights[`${key}-${index / 7}`] ?? 33 + lanes.length * weekLaneHeight) : 32 });
    }
    const height = weeks.reduce((sum, week) => sum + week.height, 0);
    const ids = new Set(days.flatMap(day => day.events.map(item => item.event.id)));
    months.push({ key, weeks, height, offset, events: events.filter(event => ids.has(event.id)).sort((a, b) => new Date(a.start) - new Date(b.start)) });
    offset += height;
  }
  return { min, max, months };
}

export function resolveMonth(calendar, requested, today) {
  const key = /^\d{4}-(0[1-9]|1[0-2])$/.test(requested || '') ? requested : today.slice(0, 7);
  return calendar.months.find(month => month.key === key) || calendar.months[key < calendar.min ? 0 : calendar.months.length - 1];
}

export function adjacentEventMonth(months, current, direction) {
  const candidates = months.filter(month => month.events.length && (direction < 0 ? month.key < current : month.key > current));
  return direction < 0 ? candidates.at(-1) : candidates[0];
}
