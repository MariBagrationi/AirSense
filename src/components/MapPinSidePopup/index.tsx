import { Component, Show, createEffect, createSignal, onMount } from 'solid-js';
import { useStore } from '../../stores';
import './styles.scss';

interface MapPinSidePopupProps {}

const MapPinSidePopup: Component<MapPinSidePopupProps> = () => {
  const [state, { toggleMapPinDetails, setMapPin }] = useStore();
  const [locationInfo, setLocationInfo] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const handleClose = () => {
    toggleMapPinDetails(false);
    setMapPin(null);
  };

  // Function to get coordinate information
  const getLocationInfo = async (lat: number, lng: number) => {
    setIsLoading(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const coordinateData = {
      coordinates: {
        latitude: lat,
        longitude: lng,
        dms: {
          latitude: convertToDMS(lat, 'lat'),
          longitude: convertToDMS(lng, 'lng'),
        },
      },
    };

    setLocationInfo(coordinateData);
    setIsLoading(false);
  };

  // Convert decimal degrees to degrees, minutes, seconds
  const convertToDMS = (coordinate: number, type: 'lat' | 'lng'): string => {
    const absolute = Math.abs(coordinate);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.floor((minutesFloat - minutes) * 60);

    const direction =
      type === 'lat'
        ? coordinate >= 0
          ? 'N'
          : 'S'
        : coordinate >= 0
          ? 'E'
          : 'W';

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  };

  // Load location info when pin is set
  onMount(() => {
    if (state.mapPin) {
      getLocationInfo(state.mapPin.latitude, state.mapPin.longitude);
    }
  });

  // Update location info when pin changes
  createEffect(() => {
    if (state.mapPin) {
      getLocationInfo(state.mapPin.latitude, state.mapPin.longitude);
    }
  });

  return (
    <Show when={state.showMapPinDetails && state.mapPin}>
      <div class="map-pin-side-popup">
        <div class="map-pin-popup-header">
          <h3>📍 Coordinates</h3>
          <button
            class="close-button"
            onClick={handleClose}
            aria-label="Close coordinates"
          >
            ×
          </button>
        </div>

        <div class="map-pin-popup-content">
          <Show
            when={isLoading()}
            fallback={
              <Show when={locationInfo()}>
                {(info) => (
                  <div class="coordinates-section">
                    <h4>Coordinates</h4>
                    <div class="coordinate-item">
                      <span class="label">Decimal:</span>
                      <span class="value">
                        {info().coordinates.latitude.toFixed(6)},{' '}
                        {info().coordinates.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div class="coordinate-item">
                      <span class="label">DMS:</span>
                      <span class="value">
                        {info().coordinates.dms.latitude},{' '}
                        {info().coordinates.dms.longitude}
                      </span>
                    </div>
                  </div>
                )}
              </Show>
            }
          >
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading coordinates...</p>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default MapPinSidePopup;
