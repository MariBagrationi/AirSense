/* eslint-disable solid/style-prop */
import MapGL, { Source, Layer, Control } from 'solid-map-gl';
import { useMapContext } from 'solid-map-gl';
import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '~/stores';
import { Geocoder } from '../Geocoder';
import { createEffect } from 'solid-js';
import { createSignal } from 'solid-js';
import GradientOverlay from '../GradientOverlay';
import '~/assets/scss/components/map.scss';
import InfoIcon from '~/assets/imgs/svgs/info.svg';

function calculateFlyToDuration(zoom: number) {
  return 2500 / (zoom / 5);
}

function Bounds() {
  const [ctx] = useMapContext();
  const [store] = useStore();

  createEffect(() => {
    if (store.bounds.length === 4) {
      ctx.map.fitBounds(
        [
          [store.bounds[0], store.bounds[1]],
          [store.bounds[2], store.bounds[3]],
        ],
        { padding: { top: 90, bottom: 150, left: 20, right: 360 } }
      );
    }
  });
  return <></>;
}

export function Map() {
  const [store, { setSelectedLocationsId, setViewport }] = useStore();
  const [selectedPoint, setSelectedPoint] = createSignal<{lat: number, lng: number} | null>(null);

  function getFeature(e: any) {
    const features = e.target.queryRenderedFeatures(e.point);
    if (features.length > 0 && features[0].properties) {
      const locationsId = features[0].properties.locations_id;
      setSelectedLocationsId(locationsId);
      
      // Set the selected point for the GradientOverlay
      const coords = features[0].geometry.coordinates;
      if (coords) {
        setSelectedPoint({
          lng: coords[0],
          lat: coords[1]
        });
        
        // Make sure the GradientOverlay is visible when a location is selected
        console.log("Selected location:", coords);
      }
      
      return coords;
    }
    return null;
  }

  const handleTimeChange = (timeOffset: number) => {
    // You can implement logic here to update the map data based on the time offset
    console.log(`Updating map data for time offset: +${timeOffset}h`);
  };

  const calculateIsMonitor = (): boolean => {
    if (!store.showMonitors && store.showAirSensors) {
      return false;
    }
    if (store.showMonitors && !store.showAirSensors) {
      return true;
    }
    return false;
  };

  const setVisibility = () => {
    let arr: any[] = ['all'];
    if (store.mapParameter !== 'all') {
      arr.push(['==', ['get', store.mapParameter], true]);
    }
    if (store.providers.length > 0) {
      arr.push(['in', ['get', 'providers_id'], ['literal', store.providers]]);
    }
    if (store.showOnlyActiveLocations) {
      arr.push(['==', ['get', 'active'], true]);
    }
    if (store.showMonitors && store.showAirSensors) {
      return arr;
    } else {
      const isMonitor = calculateIsMonitor();
      arr.push(['==', ['get', 'ismonitor'], isMonitor]);
    }
    return arr;
  };

  return (
    <div class="map-container">
      <MapGL
        class="map"
        mapLib={maplibre}
        options={{
          style: import.meta.env.VITE_MAP_STYLE,
          touchZoomRotate: false,
          dragRotate: false,
          minZoom: 1,
          maxZoom: 20,
          hash: true,
          attributionControl: false
        }}
        onError={(e) => {
          console.error("Map error:", e);
        }}
        onLoad={(e) => {
          console.log("Map loaded successfully");
        }}
        onMouseMove={(e) => {
          if (e.target.getLayer('locations')) {
            const features = e.target.queryRenderedFeatures(e.point, { layers: ['locations'] });
            e.target.getCanvas().style.cursor = features.length ? 'pointer' : '';
          }
        }}
        viewport={store.viewport}
        onViewportChange={(e) => setViewport(e)}
      >
        <Control type="scale" position="bottom-left" />
        <Geocoder />
        <Control
          type="attribution"
          position="bottom-right"
          options={{
            customAttribution: `© <a href="https://geocode.earth">Geocode Earth</a>, Powered by <a href="https://protomaps.com">Protomaps</a>`,
          }}
        />
        <Control
          type="navigation"
          position="bottom-left"
          options={{ showCompass: false, showZoom: true }}
        />
        <Source
          source={{
            id: 'locations',
            type: 'vector',
            tiles: [
              `${import.meta.env.VITE_TILES_URL}`,
            ],
            minzoom: 1,
            maxzoom: 24,
            bounds: [-180, -90, 180, 90],
          }}
        >
          <Layer
            id="locations-shadow"
            style={{
              type: 'circle',
              'source-layer': 'locations',
              paint: {
                'circle-color': 'black',
                'circle-blur': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  0.75,
                  14,
                  0.25,
                ],
                'circle-translate': [0, 4],
                'circle-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  0,
                  14,
                  0.5,
                ],
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  [
                    'case',
                    setVisibility(),
                    ['case', ['==', ['get', 'ismonitor'], true], 4, 2],
                    0,
                  ],
                  14,
                  [
                    'case',
                    setVisibility(),
                    ['case', ['==', ['get', 'ismonitor'], true], 32, 15],
                    0,
                  ],
                ],
              },
            }}
          />

          <Layer
            id="locations"
            onClick={(e) => {
              const coordinates = getFeature(e);
              if (coordinates) {
                e.target.flyTo({
                  center: coordinates,
                  zoom: e.target.getZoom() > 12 ? e.target.getZoom() : 12,
                  duration: calculateFlyToDuration(e.target.getZoom()),
                  essential: true,
                });
              }
            }}
            style={{
              type: 'circle',
              'source-layer': 'locations',
              paint: {
                'circle-color': [
                  'case',
                  ['==', ['get', 'active'], true],
                  '#6a5cd8',
                  '#7e8c9a',
                ],
                'circle-stroke-color': [
                  'case',
                  ['==', ['get', 'ismonitor'], true],
                  'white',
                  'grey',
                ],
                'circle-stroke-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  2,
                  [
                    'case',
                    setVisibility(),
                    ['case', ['==', ['get', 'ismonitor'], true], 1, 0.25],
                    0,
                  ],
                  14,
                  [
                    'case',
                    setVisibility(),
                    ['case', ['==', ['get', 'ismonitor'], true], 6, 0],
                    0,
                  ],
                ],
                'circle-stroke-opacity': ['case', setVisibility(), 1, 0],
                'circle-opacity': ['case', setVisibility(), 1, 0],
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  [
                    'case',
                    setVisibility(),
                    ['case', ['==', ['get', 'ismonitor'], true], 3, 2],
                    0,
                  ],
                  14,
                  [
                    'case',
                    setVisibility(),
                    ['case', ['==', ['get', 'ismonitor'], true], 22, 13],
                    0,
                  ],
                ],
              },
            }}
          />

          <Layer
            id="selected-location-shadow"
            style={{
              type: 'circle',
              'source-layer': 'locations',
              filter: [
                '==',
                ['get', 'locations_id'],
                ['literal', store.locationsId || 0],
              ],
              paint: {
                'circle-color': '#000000',
                'circle-blur': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  0.25,
                  14,
                  0.35,
                ],
                'circle-opacity': 0.5,
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  ['case', ['==', ['get', 'ismonitor'], true], 5, 4],
                  14,
                  ['case', ['==', ['get', 'ismonitor'], true], 25, 17],
                ],
              },
            }}
          />
          <Layer
            id="selected-location"
            style={{
              type: 'circle',
              'source-layer': 'locations',
              filter: [
                '==',
                ['get', 'locations_id'],
                ['literal', store.locationsId || 0],
              ],
              paint: {
                'circle-color': [
                  'case',
                  ['==', ['get', 'active'], true],
                  '#6a5cd8',
                  '#7e8c9a',
                ],
                'circle-opacity': 1,
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  1,
                  ['case', ['==', ['get', 'ismonitor'], true], 3, 2],
                  14,
                  ['case', ['==', ['get', 'ismonitor'], true], 22, 13],
                ],
                'circle-stroke-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  2,
                  ['case', ['==', ['get', 'ismonitor'], true], 2, 1],
                  14,
                  ['case', ['==', ['get', 'ismonitor'], true], 6, 4],
                ],
                'circle-stroke-color': '#85DBD9',
              },
            }}
          />
        </Source>
        <Bounds />
      </MapGL>

      {/* GradientOverlay positioned over the map */}
      <GradientOverlay 
        coords={selectedPoint()} 
        onTimeChange={handleTimeChange}
      />

      <div class="getting-started-link">
        <InfoIcon
          viewBox="0 0 25 25"
          role="img"
          aria-label="Info Icon"
          class="info-icon"
        />
        <a href="/getting-started">Learn how to use the Explorer</a>
      </div>
    </div>
  );
}

export default Map;