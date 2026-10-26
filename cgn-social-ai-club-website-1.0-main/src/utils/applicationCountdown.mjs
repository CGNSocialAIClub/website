// Keep the countdown compact while retaining the next useful unit.
export function getApplicationCountdown(deadline, now = Date.now()) {
    if (!deadline) return null;
    const remaining = new Date(deadline).getTime() - now;
    if (!Number.isFinite(remaining)) return null;
    if (remaining <= 0) return { isExpired: true, parts: [] };
    const units = [['week', 10080], ['day', 1440], ['hour', 60], ['minute', 1]];
    let minutes = Math.floor(remaining / 60000);
    const first = units.findIndex(([, size]) => minutes >= size);
    const parts = [];
    if (first >= 0) {
        for (const [unit, size] of units.slice(first, first + 2)) {
            const value = Math.floor(minutes / size);
            minutes %= size;
            if (value) parts.push({ unit, value });
        }
    }
    return { isExpired: false, parts };
}
