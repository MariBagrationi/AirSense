import { Component, createEffect, createSignal, For } from 'solid-js';
import { useMapContext } from 'solid-map-gl';
import { WindData } from '~/data/environmental';

interface WindOverlayProps {
  data: WindData;
  visible: boolean;
  opacity?: number;
  showParticles?: boolean;
}

export const WindOverlay: Component<WindOverlayProps> = (props) => {
  const [ctx] = useMapContext();
  const [isLoaded, setIsLoaded] = createSignal(false);

  createEffect(() => {
    if (!ctx?.map || !props.data) {
      console.log('WindOverlay: Missing context or data', {
        ctx: !!ctx?.map,
        data: !!props.data,
      });
      return;
    }

    const map = ctx.map;
    console.log('WindOverlay: Setting up overlay', {
      visible: props.visible,
      dataCount: props.data.readings.length,
    });

    if (map.isStyleLoaded()) {
      setupWindLayers();
    } else {
      map.on('style.load', setupWindLayers);
    }

    function setupWindLayers() {
      console.log('WindOverlay: Setting up wind layers');

      // Remove existing sources and layers
      cleanup();

      // Create GeoJSON from wind data
      const windArrows = createWindArrowsGeoJSON(props.data.readings);

      // Add wind arrows source and layer
      map.addSource('wind-arrows', {
        type: 'geojson',
        data: windArrows,
      });

      // Simplified wind visualization using circles (for debugging)
      // map.addLayer({
      //   id: 'wind-arrows-layer',
      //   type: 'symbol',
      //   source: 'wind-arrows',
      //   layout: {
      //     'icon-image': 'wind-arrow',
      //     'icon-size': [
      //       'interpolate',
      //       ['linear'],
      //       ['get', 'speed'],
      //       0,
      //       0.3,
      //       20,
      //       1.0,
      //     ],
      //     'icon-rotate': ['get', 'direction'],
      //     'icon-rotation-alignment': 'map',
      //     'icon-allow-overlap': true,
      //     'icon-ignore-placement': true,
      //   },
      //   paint: {
      //     'icon-opacity': props.opacity || 0.8,
      //     'icon-color': [
      //       'interpolate',
      //       ['linear'],
      //       ['get', 'speed'],
      //       0,
      //       '#74ccf4',
      //       5,
      //       '#2e8b57',
      //       10,
      //       '#ffa500',
      //       15,
      //       '#ff4500',
      //       20,
      //       '#8b0000',
      //     ],
      //   },
      // });

      // Add wind speed circles (simplified for better visibility)
      map.addLayer({
        id: 'wind-speed-circles',
        type: 'circle',
        source: 'wind-arrows',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'speed'],
            0,
            5,
            10,
            15,
            20,
            25,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'speed'],
            0,
            '#74ccf4', // Light blue for calm
            5,
            '#2e8b57', // Sea green for light breeze
            10,
            '#ffa500', // Orange for moderate wind
            15,
            '#ff4500', // Red-orange for strong wind
            20,
            '#8b0000', // Dark red for very strong wind
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 2,
          'circle-opacity': props.opacity || 0.7,
        },
      });

      // Wind arrow icon creation commented out for debugging
      // if (!map.hasImage('wind-arrow')) {
      //   createWindArrowIcon(map);
      // }

      setIsLoaded(true);
    }

    function cleanup() {
      const layersToRemove = ['wind-speed-circles']; // Simplified - only the circles layer
      const sourcesToRemove = ['wind-arrows'];

      layersToRemove.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      sourcesToRemove.forEach((sourceId) => {
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });
    }

    return cleanup;
  });

  // Handle visibility changes
  createEffect(() => {
    if (!ctx?.map || !isLoaded()) return;

    const map = ctx.map;
    const visibility = props.visible ? 'visible' : 'none';

    ['wind-speed-circles'].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  });

  return null;
};

// Helper function to create wind arrows GeoJSON
function createWindArrowsGeoJSON(windReadings: any[]) {
  return {
    type: 'FeatureCollection' as const,
    features: windReadings.map((reading) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [reading.longitude, reading.latitude],
      },
      properties: {
        speed: reading.speed,
        direction: reading.direction,
        gust: reading.gust || 0,
        timestamp: reading.timestamp,
      },
    })),
  };
}

// Helper function to create wind arrow icon
function createWindArrowIcon(map: any) {
  // Create a canvas element for the wind arrow
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 40;
  canvas.height = 40;

  // Draw arrow shape
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;

  // Arrow body
  ctx.beginPath();
  ctx.moveTo(20, 5);
  ctx.lineTo(20, 30);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(20, 5);
  ctx.lineTo(15, 15);
  ctx.moveTo(20, 5);
  ctx.lineTo(25, 15);
  ctx.stroke();

  // Arrow feathers (for traditional wind barb style)
  ctx.beginPath();
  ctx.moveTo(20, 30);
  ctx.lineTo(17, 27);
  ctx.moveTo(20, 25);
  ctx.lineTo(17, 22);
  ctx.stroke();

  map.addImage('wind-arrow', canvas);
}

// Wind legend component
export const WindLegend: Component<{ visible: boolean }> = (props) => {
  return (
    <div
      class={`wind-legend ${props.visible ? 'visible' : 'hidden'}`}
      style={{
        position: 'absolute',
        top: '120px',
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
        Wind Speed (m/s)
      </div>
      <For
        each={[
          { range: '0-2', color: '#74ccf4', label: 'Calm' },
          { range: '3-7', color: '#2e8b57', label: 'Light Breeze' },
          { range: '8-12', color: '#ffa500', label: 'Moderate Wind' },
          { range: '13-17', color: '#ff4500', label: 'Strong Wind' },
          { range: '18+', color: '#8b0000', label: 'Very Strong' },
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
      <div style={{ 'margin-top': '8px', 'font-size': '10px', color: '#666' }}>
        Arrow points in wind direction
      </div>
    </div>
  );
};

// Wind particles animation (experimental feature)
export const WindParticles: Component<{
  data: WindData;
  visible: boolean;
  canvas?: HTMLCanvasElement;
}> = (props) => {
  let animationId: number;
  let particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }> = [];

  createEffect(() => {
    if (!props.visible || !props.canvas) {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      return;
    }

    const canvas = props.canvas;
    const ctx = canvas.getContext('2d')!;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles = particles.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (
          particle.life > 0 &&
          particle.x >= 0 &&
          particle.x <= canvas.width &&
          particle.y >= 0 &&
          particle.y <= canvas.height
        ) {
          const alpha = particle.life / particle.maxLife;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.fillRect(particle.x, particle.y, 2, 2);
          return true;
        }
        return false;
      });

      // Add new particles based on wind data
      if (particles.length < 200 && Math.random() < 0.3) {
        const windReading =
          props.data.readings[
            Math.floor(Math.random() * props.data.readings.length)
          ];
        const speed = windReading.speed * 0.5;
        const direction = (windReading.direction * Math.PI) / 180;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(direction) * speed,
          vy: Math.sin(direction) * speed,
          life: 60 + Math.random() * 60,
          maxLife: 120,
        });
      }

      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  });

  return null;
};
