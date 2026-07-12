"use client";

import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Map/Popover";
import { buildYandexGoUrl, buildYandexMapsUrl, buildYandexNavigatorUrl } from "@/shared/lib/mapLinks";
import { Map as MapCanvas, Marker, useVenueMapStyle, type MapPalette } from "@/shared/ui/Map/MapCanvas";

export function Map(params: MapParams): React.JSX.Element {
  const zoom = params.zoom ?? 16;
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const mapStyle = useVenueMapStyle(params.palette);

  const mapsUrl = buildYandexMapsUrl(params.lat, params.lon, zoom);
  const goUrl = buildYandexGoUrl(params.lat, params.lon);
  const navigatorUrl = buildYandexNavigatorUrl(params.lat, params.lon, zoom);

  return (
    <div className="relative h-full w-full">
      {showPlaceholder && (
        <div
          className="absolute inset-0 z-0 transition-opacity duration-150"
          style={{ backgroundColor: params.palette.land, opacity: isLoaded ? 0 : 1 }}
          onTransitionEnd={() => {
            if (isLoaded) setShowPlaceholder(false);
          }}
        />
      )}
      <MapCanvas
        initialViewState={{ longitude: params.lon, latitude: params.lat, zoom }}
        mapStyle={mapStyle}
        onLoad={() => setIsLoaded(true)}
        onError={(event) => console.error("Map failed to load", event.error)}
      >
        <Marker longitude={params.lon} latitude={params.lat}>
          <div
            className="h-4 w-4 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,.35)]"
            style={{ backgroundColor: params.palette.pin }}
          />
        </Marker>
      </MapCanvas>
      <Popover>
        <PopoverTrigger
          className="absolute right-3 bottom-3 z-[1000] cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-md backdrop-blur-sm hover:bg-white"
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
            Yandex Maps
          </a>
          <a
            href={goUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2.5 py-2 text-sm hover:bg-muted"
          >
            Yandex Go
          </a>
          <a
            href={navigatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2.5 py-2 text-sm hover:bg-muted"
          >
            Yandex Navigator
          </a>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface MapParams {
  lat: number;
  lon: number;
  zoom?: number;
  palette: MapPalette;
}
