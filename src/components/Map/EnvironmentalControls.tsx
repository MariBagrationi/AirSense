import { Component, createResource, Show } from 'solid-js';
import { useStore } from '~/stores';
import { fetchApiInfo, fetchStats, fetchHealthStatus } from '~/lib/api';

export const EnvironmentalControls: Component = () => {
  const [store, { toggleAirQualityOverlay }] = useStore();

  // Fetch API info and stats
  const [apiInfo] = createResource(fetchApiInfo);
  const [stats] = createResource(fetchStats);
  const [healthStatus] = createResource(fetchHealthStatus);

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

        <Show when={store.showAirQualityOverlay}>
          <div style={{ 'margin-left': '24px', 'font-size': '12px', color: '#666' }}>
            <Show when={!healthStatus.loading && healthStatus()}>
              <div style={{ 'margin-bottom': '4px', color: '#22c55e' }}>
                ● API Connected
              </div>
            </Show>
            <Show when={!healthStatus.loading && !healthStatus()}>
              <div style={{ 'margin-bottom': '4px', color: '#ef4444' }}>
                ● API Disconnected
              </div>
            </Show>
            <Show when={!stats.loading && stats()?.success}>
              <div style={{ 'margin-bottom': '2px' }}>
                Total Records: {stats()?.data?.totalRecords || 0}
              </div>
              <div style={{ 'margin-bottom': '2px' }}>
                Avg AQI: {stats()?.data?.avgAQI?.toFixed(1) || 'N/A'}
              </div>
              <Show when={stats()?.data?.timeRange}>
                <div style={{ 'margin-bottom': '2px', 'font-size': '11px' }}>
                  Data Range: {stats()?.data?.timeRange?.start || 'N/A'} to {stats()?.data?.timeRange?.end || 'N/A'}
                </div>
              </Show>
            </Show>
          </div>
        </Show>
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
        Real-time environmental data from API
      </div>
    </div>
  );
};
