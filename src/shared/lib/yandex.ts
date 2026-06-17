export function parseYandexCoords(url: string): { lat: number; lon: number } | null {
  let params: URLSearchParams;
  try {
    const normalized = url.includes('://') ? url : `https://stub?${url}`;
    params = new URL(normalized).searchParams;
  } catch {
    return null;
  }

  // Prefer `ll` over `pt`; both use lon,lat order (Yandex convention)
  const raw = params.get('ll') ?? params.get('pt');
  if (!raw) return null;

  const parts = raw.split(',');
  if (parts.length < 2) return null;

  const lon = parseFloat(parts[0]);
  const lat = parseFloat(parts[1]);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lon < -180 || lon > 180) return null;

  return { lat, lon };
}
