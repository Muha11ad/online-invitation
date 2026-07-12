"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import * as React from "react";
import { useCallback, useMemo } from "react"
;
import { AttributionControl, Map as MapPrimitive, Marker as MarkerPrimitive } from "react-map-gl/maplibre";
import type { ErrorEvent, LayerSpecification,  MapEvent,  StyleSpecification } from "react-map-gl/maplibre";

import positronBaseStyleJson from "@/shared/ui/Map/openfreemap-positron-base.json";


export function Map(params: MapParams): React.JSX.Element {
  const handleLoad = useCallback(
    (event: MapEvent) => {
      // Mirrors MapLibre's own post-drag "minimize" behavior (attribution_control.ts
      // _updateCompactMinimize) so the attribution starts collapsed instead of
      // briefly flashing its full expanded text on every load.
      event.target
        .getContainer()
        .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact-show")
        ?.classList.remove("maplibregl-compact-show");
      params.onLoad?.();
    },
    [params],
  );

  return (
    <MapPrimitive
      initialViewState={params.initialViewState}
      mapStyle={params.mapStyle}
      onLoad={handleLoad}
      onError={params.onError}
      style={{ width: "100%", height: "100%" }}
      scrollZoom={true}
      dragPan={true}
      dragRotate={false}
      doubleClickZoom={true}
      touchZoomRotate={true}
      touchPitch={true}
      keyboard={false}
      attributionControl={false}
    >
      <AttributionControl compact position="bottom-left" />
      {params.children}
    </MapPrimitive>
  );
}

export function Marker(params: MarkerParams): React.JSX.Element {
  return (
    <MarkerPrimitive longitude={params.longitude} latitude={params.latitude}>
      {params.children}
    </MarkerPrimitive>
  );
}

export function patchMapStyle(baseStyle: StyleSpecification, palette: MapPalette): StyleSpecification {
  return {
    ...baseStyle,
    layers: baseStyle.layers.map((layer) => patchLayer(layer, palette)),
  };
}

export function useVenueMapStyle(palette: MapPalette): StyleSpecification {
  const positronBaseStyle = positronBaseStyleJson as unknown as StyleSpecification;
  return useMemo(() => patchMapStyle(positronBaseStyle, palette), [palette, positronBaseStyle]);
}

export interface MapParams {
  initialViewState: MapViewState;
  mapStyle: StyleSpecification;
  onLoad?: () => void;
  onError?: (event: ErrorEvent) => void;
  children?: React.ReactNode;
}

export interface MapPalette {
  land: string;
  water: string;
  road: string;
  roadCasing: string;
  label: string;
  labelHalo: string;
  park?: string;
  pin: string;
}

function patchLayer(layer: LayerSpecification, palette: MapPalette): LayerSpecification {
  if (!("paint" in layer) || !layer.paint) return layer;

  const paint: Record<string, unknown> = { ...layer.paint };
  const id = layer.id;

  if (layer.type === "background") {
    setFlatColor({ paint, key: "background-color", color: palette.land });
  } else if (id.includes("water")) {
    setFlatColor({ paint, key: "fill-color", color: palette.water });
    setFlatColor({ paint, key: "line-color", color: palette.water });
  } else if (id.startsWith("road") || id.startsWith("highway")) {
    const roadColor = id.includes("casing") ? palette.roadCasing : palette.road;
    setFlatColor({ paint, key: "line-color", color: roadColor });
    setFlatColor({ paint, key: "fill-color", color: roadColor });
  } else if (palette.park && (id.includes("park") || id.includes("landcover"))) {
    setFlatColor({ paint, key: "fill-color", color: palette.park });
  }

  if (layer.type === "symbol") {
    setFlatColor({ paint, key: "text-color", color: palette.label });
    setFlatColor({ paint, key: "text-halo-color", color: palette.labelHalo });
  }

  // paint is only patched on known flat-color keys, so this reassembly is safe.
  return { ...layer, paint } as LayerSpecification;
}

function setFlatColor( params: FlatColorParams ): void {
  if (params.color && typeof params.paint[params.key] === "string") {
    params.paint[params.key] = params.color;
  }
}

interface MarkerParams {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
}

interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}
interface FlatColorParams {
  paint: Record<string, unknown>;
  key: string;
  color: string | undefined;
}
