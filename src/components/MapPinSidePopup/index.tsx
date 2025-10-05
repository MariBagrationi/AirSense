import { Component, Show, createEffect, createSignal, onMount } from 'solid-js';
import { useStore } from '../../stores';

interface MapPinSidePopupProps {}

const MapPinSidePopup: Component<MapPinSidePopupProps> = () => {
  const [state, { toggleMapPinDetails, setMapPin }] = useStore();
  const [locationInfo, setLocationInfo] = createSignal<any>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const handleClose = () => {
    toggleMapPinDetails(false);
    setMapPin(null);
  };

  // Simple function to guess location based on coordinates
  const getLocationDataFromCoordinates = (lat: number, lng: number) => {
    // Europe
    if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) {
      if (lng >= -10 && lng <= 2 && lat >= 49 && lat <= 61) {
        return {
          country: 'United Kingdom',
          region: 'British Isles',
          address: `Location in UK region (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lng >= 2 && lng <= 8 && lat >= 42 && lat <= 51) {
        return {
          country: 'France',
          region: 'Western Europe',
          address: `Location in France (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lng >= 8 && lng <= 15 && lat >= 47 && lat <= 55) {
        return {
          country: 'Germany',
          region: 'Central Europe',
          address: `Location in Germany (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lng >= 12 && lng <= 19 && lat >= 41 && lat <= 47) {
        return {
          country: 'Italy',
          region: 'Southern Europe',
          address: `Location in Italy (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lng >= -9 && lng <= -6 && lat >= 36 && lat <= 43) {
        return {
          country: 'Spain',
          region: 'Iberian Peninsula',
          address: `Location in Spain (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else {
        return {
          country: 'Europe',
          region: 'European Region',
          address: `Location in Europe (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      }
    }
    // North America
    else if (lat >= 25 && lat <= 72 && lng >= -170 && lng <= -52) {
      if (lat >= 25 && lat <= 49 && lng >= -125 && lng <= -66) {
        return {
          country: 'United States',
          region: 'North America',
          address: `Location in USA (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lat >= 41 && lat <= 72 && lng >= -141 && lng <= -52) {
        return {
          country: 'Canada',
          region: 'North America',
          address: `Location in Canada (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else {
        return {
          country: 'North America',
          region: 'North American Region',
          address: `Location in North America (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      }
    }
    // Asia
    else if (lat >= -10 && lat <= 70 && lng >= 60 && lng <= 180) {
      if (lat >= 20 && lat <= 50 && lng >= 73 && lng <= 135) {
        return {
          country: 'China',
          region: 'East Asia',
          address: `Location in China (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lat >= 30 && lat <= 46 && lng >= 129 && lng <= 146) {
        return {
          country: 'Japan',
          region: 'East Asia',
          address: `Location in Japan (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
        return {
          country: 'India',
          region: 'South Asia',
          address: `Location in India (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      } else {
        return {
          country: 'Asia',
          region: 'Asian Region',
          address: `Location in Asia (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      }
    }
    // Africa
    else if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 52) {
      return {
        country: 'Africa',
        region: 'African Region',
        address: `Location in Africa (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      };
    }
    // South America
    else if (lat >= -56 && lat <= 15 && lng >= -82 && lng <= -32) {
      return {
        country: 'South America',
        region: 'South American Region',
        address: `Location in South America (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      };
    }
    // Australia/Oceania
    else if (lat >= -47 && lat <= -9 && lng >= 110 && lng <= 180) {
      return {
        country: 'Australia',
        region: 'Oceania',
        address: `Location in Australia (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      };
    }
    // Ocean/Unknown
    else {
      return {
        country: 'Ocean/Remote Area',
        region: 'International Waters',
        address: `Remote location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      };
    }
  };

  // Mock function to get location information
  // In a real app, this would call a reverse geocoding API
  const getLocationInfo = async (lat: number, lng: number) => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock location data - in real app, use reverse geocoding
    const locationData = getLocationDataFromCoordinates(lat, lng);
    const mockData = {
      address: locationData.address,
      country: locationData.country,
      region: locationData.region,
      elevation: Math.floor(Math.random() * 1000) + 'm',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      coordinates: {
        latitude: lat,
        longitude: lng,
        dms: {
          latitude: convertToDMS(lat, 'lat'),
          longitude: convertToDMS(lng, 'lng'),
        },
      },
    };

    setLocationInfo(mockData);
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
          <h3>📍 Location Details</h3>
          <button
            class="close-button"
            onClick={handleClose}
            aria-label="Close location details"
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
                  <>
                    <div class="location-section">
                      <h4>Address</h4>
                      <p>{info().address}</p>
                    </div>

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

                    <div class="details-grid">
                      <div class="detail-item">
                        <span class="detail-label">Country</span>
                        <span class="detail-value">{info().country}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Region</span>
                        <span class="detail-value">{info().region}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Elevation</span>
                        <span class="detail-value">{info().elevation}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Timezone</span>
                        <span class="detail-value">{info().timezone}</span>
                      </div>
                    </div>

                    <div class="actions-section">
                      <button
                        class="copy-button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${info().coordinates.latitude}, ${info().coordinates.longitude}`
                          );
                        }}
                      >
                        📋 Copy Coordinates
                      </button>
                    </div>
                  </>
                )}
              </Show>
            }
          >
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading location information...</p>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default MapPinSidePopup;
