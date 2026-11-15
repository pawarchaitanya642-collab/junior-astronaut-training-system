import assert from 'node:assert/strict';
import test from 'node:test';
import { EONET_API_URL, fetchEarthEvents, normalizeEarthEvent } from './nasa.js';

const sampleEvent = {
  id: 'EONET_42',
  title: 'Example event',
  link: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_42',
  categories: [{ title: 'Wildfires' }],
  geometry: [
    { type: 'Point', coordinates: [-120, 35], date: '2026-01-01T00:00:00Z' },
    { type: 'Point', coordinates: [-121, 36], date: '2026-01-02T00:00:00Z', magnitudeValue: 12, magnitudeUnit: 'acres' }
  ]
};

test('normalizes the most recent event geometry and preserves NASA metadata', () => {
  assert.deepEqual(normalizeEarthEvent(sampleEvent), {
    id: 'EONET_42',
    title: 'Example event',
    categories: ['Wildfires'],
    date: '2026-01-02T00:00:00Z',
    longitude: -121,
    latitude: 36,
    magnitude: 12,
    magnitudeUnit: 'acres',
    url: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_42'
  });
});

test('uses an approximate centroid for polygon events and a safe NASA URL', () => {
  const event = normalizeEarthEvent({
    id: 'EONET_43',
    title: 'Polygon event',
    link: 'javascript:alert(1)',
    geometry: [{ type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 2], [0, 2], [0, 0]]] }]
  });
  assert.equal(event.longitude, 1.6);
  assert.equal(event.latitude, 0.8);
  assert.equal(event.url, 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_43');
  assert.equal(event.magnitude, null);
});

test('ignores malformed events without mappable coordinates', () => {
  assert.equal(normalizeEarthEvent({ id: 'bad', title: 'No geometry', geometry: [] }), null);
  assert.equal(normalizeEarthEvent({ id: 'bad', title: 'Out of bounds', geometry: [{ coordinates: [[400, 100]] }] }), null);
});

test('fetches and normalizes NASA EONET events', async () => {
  let requestedUrl = '';
  const fetchImpl = async (url, options) => {
    requestedUrl = url;
    assert.equal(options.headers.Accept, 'application/json');
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ events: [sampleEvent, { id: 'bad', title: 'bad' }] }) };
  };
  const events = await fetchEarthEvents(fetchImpl);
  assert.equal(requestedUrl, EONET_API_URL);
  assert.equal(events.length, 1);
  assert.equal(events[0].id, 'EONET_42');
});

test('reports HTTP and malformed API responses', async () => {
  await assert.rejects(fetchEarthEvents(async () => ({ ok: false, status: 503 })), /HTTP 503/);
  await assert.rejects(fetchEarthEvents(async () => ({ ok: true, json: async () => ({}) })), /unexpected response/);
});
