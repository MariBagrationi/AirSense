import { Component, createEffect, createSignal } from 'solid-js';
import { useMapContext } from 'solid-map-gl';
import { useStore } from '~/stores';

interface MapLongClickHandlerProps {}

export const MapLongClickHandler: Component<MapLongClickHandlerProps> = () => {
  const [ctx] = useMapContext();
  const [state, { setMapPin, toggleMapPinDetails }] = useStore();
  const [longPressTimer, setLongPressTimer] = createSignal<number | null>(null);
  const [isLongPress, setIsLongPress] = createSignal(false);

  createEffect(() => {
    if (!ctx?.map) return;

    const map = ctx.map;

    // Mouse down handler to start long press timer
    const handleMouseDown = (e: any) => {
      setIsLongPress(false);
      const timer = window.setTimeout(() => {
        setIsLongPress(true);
        handleLongClick(e);
      }, 500); // 500ms for long press

      setLongPressTimer(timer);
    };

    // Mouse up handler to clear timer
    const handleMouseUp = () => {
      const timer = longPressTimer();
      if (timer) {
        clearTimeout(timer);
        setLongPressTimer(null);
      }
    };

    // Mouse move handler to cancel long press if user drags
    const handleMouseMove = () => {
      const timer = longPressTimer();
      if (timer) {
        clearTimeout(timer);
        setLongPressTimer(null);
      }
    };

    // Handle long click event
    const handleLongClick = (e: any) => {
      console.log('Long click at:', e.lngLat);

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

    // Prevent regular click events during long press
    const originalClickHandler = (e: any) => {
      if (isLongPress()) {
        // Just reset the long press state, don't try to prevent default
        setIsLongPress(false);
        return false; // This stops further event propagation in MapLibre
      }
    };

    map.on('click', originalClickHandler);

    // Cleanup function
    return () => {
      const timer = longPressTimer();
      if (timer) {
        clearTimeout(timer);
      }

      map.off('mousedown', handleMouseDown);
      map.off('mouseup', handleMouseUp);
      map.off('mousemove', handleMouseMove);
      map.off('click', originalClickHandler);

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

export default MapLongClickHandler;
