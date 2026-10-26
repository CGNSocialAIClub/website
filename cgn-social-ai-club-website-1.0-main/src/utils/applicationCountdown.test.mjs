import test from 'node:test';
import assert from 'node:assert/strict';
import { getApplicationCountdown } from './applicationCountdown.mjs';
const at = minutes => getApplicationCountdown(new Date(minutes * 60000).toISOString(), 0);
test('uses the two largest adjacent units without zero or irrelevant units', () => {
    assert.deepEqual(at(9 * 1440 + 59).parts, [{ unit: 'week', value: 1 }, { unit: 'day', value: 2 }]);
    assert.deepEqual(at(2 * 1440 + 120).parts, [{ unit: 'day', value: 2 }, { unit: 'hour', value: 2 }]);
    assert.deepEqual(at(61).parts, [{ unit: 'hour', value: 1 }, { unit: 'minute', value: 1 }]);
    assert.deepEqual(at(1).parts, [{ unit: 'minute', value: 1 }]);
    assert.deepEqual(at(60).parts, [{ unit: 'hour', value: 1 }]);
});
test('handles the final minute, expiry and unset deadlines', () => {
    assert.deepEqual(at(0.5), { isExpired: false, parts: [] });
    assert.equal(at(0).isExpired, true);
    assert.equal(at(-1).isExpired, true);
    assert.equal(getApplicationCountdown(null), null);
    assert.equal(getApplicationCountdown('invalid'), null);
});
test('Munich deadline includes the October daylight-saving change', () => {
    assert.equal(new Date('2026-10-26T23:59:00+01:00').toISOString(), '2026-10-26T22:59:00.000Z');
});
