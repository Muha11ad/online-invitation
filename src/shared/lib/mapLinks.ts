const YANDEX_GO_TRACKING_ID = '1178268795219780156';

export function buildYandexMapsUrl(lat: number, lon: number, zoom = 16): string {
  const params = new URLSearchParams({
    pt: `${lon},${lat}`,
    z: String(zoom),
    l: 'map',
  });
  return `https://yandex.ru/maps/?${params.toString()}`;
}

export function buildYandexGoUrl(lat: number, lon: number, ref = 'wedding-invite'): string {
  const params = new URLSearchParams({
    'end-lat': String(lat),
    'end-lon': String(lon),
    ref,
    appmetrica_tracking_id: YANDEX_GO_TRACKING_ID,
  });
  return `https://3.redirect.appmetrica.yandex.com/route?${params.toString()}`;
}

export function buildYandexNavigatorUrl(lat: number, lon: number, zoom = 16): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    zoom: String(zoom),
  });
  return `yandexnavi://show_point_on_map?${params.toString()}`;
}
