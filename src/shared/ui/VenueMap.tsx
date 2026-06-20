'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lon: number;
  zoom?: number;
}

export function VenueMap({ lat, lon, zoom = 16 }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: import('leaflet').Map;

    void import('leaflet').then((L) => {
      map = L.map(container, { zoomControl: false }).setView([lat, lon], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: '<div style="width:12px;height:12px;border-radius:50%;background:#8A9A82;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      L.marker([lat, lon], { icon }).addTo(map);
    });

    return () => {
      map?.remove();
    };
  }, [lat, lon, zoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ filter: 'grayscale(0.85) contrast(0.88) brightness(1.06)' }}
    />
  );
}
