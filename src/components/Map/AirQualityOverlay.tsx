import { Component, createEffect, createSignal, For } from 'solid-js';
import { useMapContext } from 'solid-map-gl';
import { AirQualityGradientData } from '~/data/environmental';
import { useStore } from '~/stores';

interface AirQualityOverlayProps {
  data: AirQualityGradientData;
  visible: boolean;
  opacity?: number;
}

export const AirQualityOverlay: Component<AirQualityOverlayProps> = (props) => {
  const [ctx] = useMapContext();
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [state, { setSelectedAirQualityPoint, toggleAirQualityDetails }] =
    useStore();

  createEffect(() => {
    if (!ctx?.map || !props.data) {
      console.log('AirQualityOverlay: Missing context or data', {
        ctx: !!ctx?.map,
        data: !!props.data,
      });
      return;
    }

    const map = ctx.map;
    console.log('AirQualityOverlay: Setting up overlay', {
      visible: props.visible,
      dataCount: props.data.readings.length,
    });

    // Wait for map to be loaded
    if (map.isStyleLoaded()) {
      setupHeatmapLayer();
    } else {
      map.on('style.load', setupHeatmapLayer);
    }

    function setupHeatmapLayer() {
      console.log('AirQualityOverlay: Setting up heatmap layer');

      // Remove existing sources and layers if they exist
      if (map.getSource('air-quality-heatmap')) {
        if (map.getLayer('air-quality-heatmap-layer')) {
          map.removeLayer('air-quality-heatmap-layer');
        }
        if (map.getLayer('air-quality-points')) {
          map.removeLayer('air-quality-points');
        }
        map.removeSource('air-quality-heatmap');
      }

      // Create GeoJSON from air quality data
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: props.data.readings.map((reading) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [reading.longitude, reading.latitude],
          },
          properties: {
            aqi: reading.aqi,
            pm25: reading.pm25,
            pm10: reading.pm10,
            o3: reading.o3,
            no2: reading.no2,
            so2: reading.so2,
            timestamp: reading.timestamp,
          },
        })),
      };

      // Add source
      map.addSource('air-quality-heatmap', {
        type: 'geojson',
        data: geojsonData,
      });

      // Add heatmap layer (simplified for better visibility)
      map.addLayer({
        id: 'air-quality-heatmap-layer',
        type: 'heatmap',
        source: 'air-quality-heatmap',
        paint: {
          // Increase the heatmap weight based on AQI value
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'aqi'],
            0,
            0.1,
            500,
            1,
          ],
          // Increase the heatmap color intensity
          'heatmap-intensity': 2,
          // Color ramp for heatmap - more visible colors
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0,0,255,0)', // Transparent blue
            0.2,
            'rgba(0,255,0,0.6)', // Green
            0.4,
            'rgba(255,255,0,0.7)', // Yellow
            0.6,
            'rgba(255,165,0,0.8)', // Orange
            0.8,
            'rgba(255,0,0,0.9)', // Red
            1,
            'rgba(128,0,0,1)', // Dark red
          ],
          // Adjust the heatmap radius
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            10,
            15,
            40,
          ],
          // Make it always visible
          'heatmap-opacity': props.opacity || 0.8,
        },
      });

      // Add circle layer for high zoom levels to show individual points
      map.addLayer({
        id: 'air-quality-points',
        type: 'circle',
        source: 'air-quality-heatmap',
        minzoom: 5,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1,
            4,
            10,
            8,
            15,
            15,
          ],
          'circle-color': [
            'case',
            ['<', ['get', 'aqi'], 51],
            '#00e400', // Good
            ['<', ['get', 'aqi'], 101],
            '#ffff00', // Moderate
            ['<', ['get', 'aqi'], 151],
            '#ff7e00', // Unhealthy for Sensitive
            ['<', ['get', 'aqi'], 201],
            '#ff0000', // Unhealthy
            ['<', ['get', 'aqi'], 301],
            '#8f3f97', // Very Unhealthy
            '#7e0023', // Hazardous
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2,
          'circle-opacity': props.opacity || 0.8,
        },
      });

      console.log('Air quality layers added successfully:', {
        heatmapLayer: map.getLayer('air-quality-heatmap-layer'),
        pointsLayer: map.getLayer('air-quality-points'),
        source: map.getSource('air-quality-heatmap'),
      });

      // Add click event handler for air quality points
      console.log('Adding click event handler for air-quality-points layer');
      map.on('click', 'air-quality-points', (e: any) => {
        console.log('Air quality point clicked:', e.features?.[0]);

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties;

          // Create air quality reading object from feature properties
          const airQualityReading = {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            aqi: properties.aqi,
            pm25: properties.pm25,
            pm10: properties.pm10,
            o3: properties.o3,
            no2: properties.no2,
            so2: properties.so2,
            timestamp: properties.timestamp,
          };

          // Set the selected point and show the details overlay
          setSelectedAirQualityPoint(airQualityReading);
          toggleAirQualityDetails(true);
        }
      });

      // Change cursor to pointer when hovering over air quality points
      map.on('mouseenter', 'air-quality-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'air-quality-points', () => {
        map.getCanvas().style.cursor = '';
      });

      setIsLoaded(true);
    }

    // Cleanup function
    return () => {
      if (map.getSource('air-quality-heatmap')) {
        // Remove event listeners
        map.off('click', 'air-quality-points');
        map.off('mouseenter', 'air-quality-points');
        map.off('mouseleave', 'air-quality-points');

        // Remove layers and source
        if (map.getLayer('air-quality-heatmap-layer')) {
          map.removeLayer('air-quality-heatmap-layer');
        }
        if (map.getLayer('air-quality-points')) {
          map.removeLayer('air-quality-points');
        }
        map.removeSource('air-quality-heatmap');
      }
    };
  });

  // Handle visibility changes
  createEffect(() => {
    if (!ctx?.map || !isLoaded()) return;

    const map = ctx.map;
    const visibility = props.visible ? 'visible' : 'none';

    if (map.getLayer('air-quality-heatmap-layer')) {
      map.setLayoutProperty(
        'air-quality-heatmap-layer',
        'visibility',
        visibility
      );
    }
    if (map.getLayer('air-quality-points')) {
      map.setLayoutProperty('air-quality-points', 'visibility', visibility);
    }
  });

  return null; // This component doesn't render any DOM elements
};

// Utility component for AQI legend
export const AirQualityLegend: Component<{ visible: boolean }> = (props) => {
  return (
    <div
      class={`air-quality-legend ${props.visible ? 'visible' : 'hidden'}`}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        'border-radius': '5px',
        'font-size': '12px',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
        'z-index': 1000,
      }}
    >
      <div style={{ 'font-weight': 'bold', 'margin-bottom': '5px' }}>
        Air Quality Index
      </div>
      <For
        each={[
          { range: '0-50', color: '#00e400', label: 'Good' },
          { range: '51-100', color: '#ffff00', label: 'Moderate' },
          {
            range: '101-150',
            color: '#ff7e00',
            label: 'Unhealthy for Sensitive',
          },
          { range: '151-200', color: '#ff0000', label: 'Unhealthy' },
          { range: '201-300', color: '#8f3f97', label: 'Very Unhealthy' },
          { range: '301+', color: '#7e0023', label: 'Hazardous' },
        ]}
      >
        {(item) => (
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              margin: '2px 0',
            }}
          >
            <div
              style={{
                width: '15px',
                height: '15px',
                'background-color': item.color,
                'margin-right': '5px',
                border: '1px solid #ccc',
              }}
            />
            <span style={{ 'font-size': '10px' }}>
              {item.range} - {item.label}
            </span>
          </div>
        )}
      </For>
    </div>
  );
};
