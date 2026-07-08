"use client";

import { useEffect, useState } from "react";
import React from "react";
import ReactDOM from "react-dom";
import {
  buildYandexGoUrl,
  buildYandexMapsUrl,
  buildYandexNavigatorUrl,
} from "@/shared/lib/mapLinks";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

export function VenueMap(params: VenueMapParams): React.JSX.Element {
  const zoom = params.zoom ?? 16;
  const [components, setComponents] = useState<ReactifiedComponents | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    if (!apiKey) return;

    let cancelled = false;
    void loadYandexMapsApi(apiKey)
      .then((ymaps3) => getReactifiedYmaps3(ymaps3))
      .then((loaded) => {
        if (!cancelled) setComponents(loaded);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const mapsUrl = buildYandexMapsUrl(params.lat, params.lon, zoom);
  const goUrl = buildYandexGoUrl(params.lat, params.lon);
  const navigatorUrl = buildYandexNavigatorUrl(params.lat, params.lon, zoom);

  return (
    <div className="relative h-full w-full">
      {components && (
        <YandexMapView lat={params.lat} lon={params.lon} zoom={zoom} components={components} />
      )}
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

type Ymaps3 = typeof import("@yandex/ymaps3-types");

declare global {
  interface Window {
    ymaps3?: Ymaps3;
  }
}

interface VenueMapParams {
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
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=en_US`;
    script.onload = () => resolve(window.ymaps3 as Ymaps3);
    script.onerror = () => reject(new Error("Failed to load Yandex Maps API"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

async function loadReactifiedYmaps3(ymaps3: Ymaps3) {
  await ymaps3.ready;
  const ymaps3React = await ymaps3.import("@yandex/ymaps3-reactify");
  const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } =
    reactify.module(ymaps3);
  return { reactify, YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker };
}

type ReactifiedComponents = Awaited<ReturnType<typeof loadReactifiedYmaps3>>;

let reactifyPromise: ReturnType<typeof loadReactifiedYmaps3> | null = null;

function getReactifiedYmaps3(ymaps3: Ymaps3): ReturnType<typeof loadReactifiedYmaps3> {
  reactifyPromise ??= loadReactifiedYmaps3(ymaps3);
  return reactifyPromise;
}

interface YandexMapViewParams {
  lat: number;
  lon: number;
  zoom: number;
  components: ReactifiedComponents;
}

function YandexMapView(params: YandexMapViewParams): React.JSX.Element {
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, reactify } =
    params.components;
  const location = reactify.useDefault(
    { center: [params.lon, params.lat] as [number, number], zoom: params.zoom },
    [params.lat, params.lon, params.zoom],
  );
  const coordinates = reactify.useDefault([params.lon, params.lat] as [number, number], [
    params.lat,
    params.lon,
  ]);

  return (
    <YMap location={location} className="h-full w-full">
      <YMapDefaultSchemeLayer />
      <YMapDefaultFeaturesLayer />
      <YMapMarker coordinates={coordinates}>
        <div className="h-4 w-4 rounded-full border-2 border-white bg-[#8A9A82] shadow-[0_1px_4px_rgba(0,0,0,.35)]" />
      </YMapMarker>
    </YMap>
  );
}
