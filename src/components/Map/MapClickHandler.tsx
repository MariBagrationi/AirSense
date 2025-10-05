import { Component, createEffect, createSignal } from 'solid-js';
import { useMapContext } from 'solid-map-gl';
import { useStore } from '~/stores';

interface MapClickHandlerProps {}

export const MapClickHandler: Component<MapClickHandlerProps> = () => {
  const [ctx] = useMapContext();
  const [state, { setMapPin, toggleMapPinDetails }] = useStore();
  const [mouseDownPosition, setMouseDownPosition] = createSignal<{
    x: number;
    y: number;
  } | null>(null);
  const [hasMoved, setHasMoved] = createSignal(false);

  createEffect(() => {
    if (!ctx?.map) return;

    const map = ctx.map;

    // Mouse down handler to track initial position
    const handleMouseDown = (e: any) => {
      setHasMoved(false);
      // Store initial mouse position
      setMouseDownPosition({ x: e.point.x, y: e.point.y });
    };

    // Mouse up handler to reset tracking
    const handleMouseUp = () => {
      setMouseDownPosition(null);
      setHasMoved(false);
    };

    // Mouse move handler to detect if user is panning
    const handleMouseMove = (e: any) => {
      const startPos = mouseDownPosition();
      if (startPos) {
        // Calculate distance moved from initial position
        const deltaX = Math.abs(e.point.x - startPos.x);
        const deltaY = Math.abs(e.point.y - startPos.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // If moved more than 5 pixels, consider it panning
        if (distance > 5) {
          setHasMoved(true);
        }
      }
    };

    // Handle single click event to place pin
    const handleClick = (e: any) => {
      // Only place pin if user didn't pan (moved less than 5 pixels)
      if (!hasMoved()) {
        console.log('Single click registered at:', e.lngLat);
        placePinAtLocation(e);
      }
    };

    // Function to place pin at clicked location
    const placePinAtLocation = (e: any) => {
      // Remove existing pin if any
      if (map.getSource('map-pin')) {
        if (map.getLayer('map-pin-layer')) {
          map.removeLayer('map-pin-layer');
        }
        map.removeSource('map-pin');
      }

      // Add new pin at clicked location
      const pinData = {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [e.lngLat.lng, e.lngLat.lat],
            },
            properties: {
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng,
            },
          },
        ],
      };

      // Add source for the pin
      map.addSource('map-pin', {
        type: 'geojson',
        data: pinData,
      });

      // Add layer for the pin (red circle with white border)
      map.addLayer({
        id: 'map-pin-layer',
        type: 'circle',
        source: 'map-pin',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ff0000',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      // Set pin data in store and show details
      setMapPin({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
      });

      toggleMapPinDetails(true);
    };

    // Add event listeners
    map.on('mousedown', handleMouseDown);
    map.on('mouseup', handleMouseUp);
    map.on('mousemove', handleMouseMove);
    map.on('click', handleClick);

    // Cleanup function
    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mouseup', handleMouseUp);
      map.off('mousemove', handleMouseMove);
      map.off('click', handleClick);

      // Remove pin layer and source if they exist
      if (map.getSource('map-pin')) {
        if (map.getLayer('map-pin-layer')) {
          map.removeLayer('map-pin-layer');
        }
        map.removeSource('map-pin');
      }
    };
  });

  return null; // This component doesn't render any DOM elements
};

export default MapClickHandler;
