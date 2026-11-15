export const EONET_API_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100';

function coordinatesFor(geometry) {
  if (!geometry || !Array.isArray(geometry.coordinates)) return null;

  const points = [];
  function collect(value) {
    if (!Array.isArray(value) || points.length >= 300) return;
    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      if (Number.isFinite(value[0]) && Number.isFinite(value[1])) points.push(value);
      return;
    }
    value.forEach(collect);
  }
  collect(geometry.coordinates);
  if (!points.length) return null;

  const longitude = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const latitude = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  return { longitude, latitude };
}

function trustedEventUrl(value, id) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.hostname === 'eonet.gsfc.nasa.gov') return url.href;
  } catch {}
  return `https://eonet.gsfc.nasa.gov/api/v3/events/${encodeURIComponent(id)}`;
}

export function normalizeEarthEvent(record) {
  if (!record || typeof record.id !== 'string' || typeof record.title !== 'string') return null;
  const geometryList = Array.isArray(record.geometry) ? record.geometry : [];
  const geometry = geometryList.at(-1);
  const location = coordinatesFor(geometry);
  if (!location) return null;

  const categories = Array.isArray(record.categories)
    ? record.categories.map(category => category?.title).filter(title => typeof title === 'string' && title)
    : [];
  const magnitude = geometry.magnitudeValue == null ? null : Number(geometry.magnitudeValue);
  return {
    id: record.id,
    title: record.title,
    categories,
    date: typeof geometry.date === 'string' ? geometry.date : '',
    ...location,
    magnitude: Number.isFinite(magnitude) ? magnitude : null,
    magnitudeUnit: typeof geometry.magnitudeUnit === 'string' ? geometry.magnitudeUnit : '',
    url: trustedEventUrl(record.link, record.id)
  };
}

export async function fetchEarthEvents(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new Error('Fetch is unavailable in this browser.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(EONET_API_URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`NASA EONET returned HTTP ${response.status}.`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.events)) throw new Error('NASA EONET returned an unexpected response.');
    return payload.events.map(normalizeEarthEvent).filter(Boolean);
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('NASA EONET request timed out after 15 seconds.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
