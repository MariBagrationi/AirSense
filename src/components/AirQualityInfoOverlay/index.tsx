import { Component, Show } from 'solid-js';
import { AirQualityReading } from '../../data/environmental';
import { useStore } from '../../stores';

interface AirQualityInfoOverlayProps {}

const AirQualityInfoOverlay: Component<AirQualityInfoOverlayProps> = () => {
  const [state, { toggleAirQualityDetails, setSelectedAirQualityPoint }] =
    useStore();

  const handleClose = () => {
    toggleAirQualityDetails(false);
    setSelectedAirQualityPoint(null);
  };

  const getAQILevel = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
  };

  return (
    <Show when={state.showAirQualityDetails && state.selectedAirQualityPoint}>
      <div class="air-quality-info-overlay">
        <div class="air-quality-info-content">
          <div class="air-quality-info-header">
            <h3>Air Quality Information</h3>
            <button
              class="close-button"
              onClick={handleClose}
              aria-label="Close air quality info"
            >
              ×
            </button>
          </div>

          <div class="air-quality-info-body">
            <Show when={state.selectedAirQualityPoint}>
              {(point) => {
                const data = point() as AirQualityReading;
                return (
                  <>
                    <div class="location-info">
                      <h4>Location</h4>
                      <p>
                        Lat: {data.latitude.toFixed(4)}, Lng:{' '}
                        {data.longitude.toFixed(4)}
                      </p>
                    </div>

                    <div class="aqi-main">
                      <div
                        class="aqi-circle"
                        style={{ 'background-color': getAQIColor(data.aqi) }}
                      >
                        <span class="aqi-value">{data.aqi}</span>
                      </div>
                      <div class="aqi-description">
                        <h4>Air Quality Index</h4>
                        <p class="aqi-level">{getAQILevel(data.aqi)}</p>
                      </div>
                    </div>

                    <div class="pollutants-grid">
                      <div class="pollutant-item">
                        <span class="pollutant-label">PM2.5</span>
                        <span class="pollutant-value">{data.pm25} μg/m³</span>
                      </div>
                      <div class="pollutant-item">
                        <span class="pollutant-label">PM10</span>
                        <span class="pollutant-value">{data.pm10} μg/m³</span>
                      </div>
                      <div class="pollutant-item">
                        <span class="pollutant-label">O₃</span>
                        <span class="pollutant-value">{data.o3} μg/m³</span>
                      </div>
                      <div class="pollutant-item">
                        <span class="pollutant-label">NO₂</span>
                        <span class="pollutant-value">{data.no2} μg/m³</span>
                      </div>
                      <div class="pollutant-item">
                        <span class="pollutant-label">SO₂</span>
                        <span class="pollutant-value">{data.so2} μg/m³</span>
                      </div>
                    </div>

                    <div class="timestamp">
                      <small>
                        Last updated:{' '}
                        {new Date(data.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </>
                );
              }}
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default AirQualityInfoOverlay;
