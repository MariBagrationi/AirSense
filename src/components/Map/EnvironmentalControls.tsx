import { Component } from 'solid-js';
import { useStore } from '~/stores';

export const EnvironmentalControls: Component = () => {
  const [store, { toggleAirQualityOverlay, setAirQualityOpacity }] = useStore();

  return (
    <div
      class="environmental-controls"
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        'border-radius': '8px',
        'box-shadow': '0 2px 8px rgba(0,0,0,0.15)',
        'font-family': 'system-ui, sans-serif',
        'font-size': '14px',
        'z-index': 1000,
        'min-width': '200px',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          'font-size': '16px',
          'font-weight': '600',
          color: '#333',
        }}
      >
        Environmental Data
      </h3>

      {/* Air Quality Controls */}
      <div style={{ 'margin-bottom': '15px' }}>
        <label
          style={{
            display: 'flex',
            'align-items': 'center',
            cursor: 'pointer',
            'margin-bottom': '8px',
          }}
        >
          <input
            type="checkbox"
            checked={store.showAirQualityOverlay}
            onChange={toggleAirQualityOverlay}
            style={{ 'margin-right': '8px' }}
          />
          <span style={{ 'font-weight': '500' }}>Air Quality Overlay</span>
        </label>

        {store.showAirQualityOverlay && (
          <div style={{ 'margin-left': '24px' }}>
            <label
              style={{
                display: 'block',
                'font-size': '12px',
                color: '#666',
                'margin-bottom': '4px',
              }}
            >
              Opacity: {Math.round(store.airQualityOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={store.airQualityOpacity}
              onInput={(e) =>
                setAirQualityOpacity(parseFloat(e.currentTarget.value))
              }
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          'font-size': '11px',
          color: '#888',
          'border-top': '1px solid #eee',
          'padding-top': '8px',
          'margin-top': '12px',
        }}
      >
        Toggle overlays to visualize environmental data
      </div>
    </div>
  );
};
