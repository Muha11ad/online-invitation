'use client';

import { useEffect, useRef } from 'react';
import {
  buildYandexGoUrl,
  buildYandexMapsUrl,
  buildYandexNavigatorUrl,
} from '@/shared/lib/mapLinks';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';

type Ymaps3 = typeof import('@yandex/ymaps3-types');

declare global {
  interface Window {
    ymaps3?: Ymaps3;
  }
}

interface Props {
  lat: number;
  lon: number;
  zoom?: number;
}

let scriptPromise: Promise<Ymaps3> | null = null;

function loadYandexMapsApi(apiKey: string): Promise<Ymaps3> {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.ymaps3) {
      resolve(window.ymaps3);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=en_US`;
    script.onload = () => resolve(window.ymaps3 as Ymaps3);
    script.onerror = () => reject(new Error('Failed to load Yandex Maps API'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function VenueMap({ lat, lon, zoom = 16 }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    if (!container || !apiKey) return;

    let map: InstanceType<Ymaps3['YMap']> | undefined;
    let cancelled = false;

    void loadYandexMapsApi(apiKey).then(async (ymaps3) => {
      await ymaps3.ready;
      if (cancelled) return;

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;

      map = new YMap(container, {
        location: { center: [lon, lat], zoom },
      });

      map.addChild(new YMapDefaultSchemeLayer({}));
      map.addChild(new YMapDefaultFeaturesLayer({}));

      const markerElement = document.createElement('div');
      markerElement.style.width = '16px';
      markerElement.style.height = '16px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.background = '#8A9A82';
      markerElement.style.border = '2px solid white';
      markerElement.style.boxShadow = '0 1px 4px rgba(0,0,0,.35)';

      map.addChild(new YMapMarker({ coordinates: [lon, lat] }, markerElement));
    });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [lat, lon, zoom]);

  const mapsUrl = buildYandexMapsUrl(lat, lon, zoom);
  const goUrl = buildYandexGoUrl(lat, lon);
  const navigatorUrl = buildYandexNavigatorUrl(lat, lon, zoom);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <Popover>
        <PopoverTrigger
          className="absolute bottom-3 right-3 z-[1000] rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-md backdrop-blur-sm cursor-pointer hover:bg-white"
          aria-label="Open location in a maps app"
        >
          Open in Maps
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2.5 py-2 text-sm hover:bg-muted"
          >
            Open in Yandex Maps
          </a>
          <a
            href={goUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2.5 py-2 text-sm hover:bg-muted"
          >
            Open in Yandex Go
          </a>
          <a
            href={navigatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2.5 py-2 text-sm hover:bg-muted"
          >
            Open in Yandex Navigator
          </a>
        </PopoverContent>
      </Popover>
    </div>
  );
}
