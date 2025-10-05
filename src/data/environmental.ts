// Air Quality and Wind Data Types and Mock Data
export interface AirQualityReading {
  latitude: number;
  longitude: number;
  aqi: number; // Air Quality Index (0-500)
  pm25: number; // PM2.5 in µg/m³
  pm10: number; // PM10 in µg/m³
  o3: number; // Ozone in µg/m³
  no2: number; // Nitrogen dioxide in µg/m³
  so2: number; // Sulfur dioxide in µg/m³
  timestamp: string;
}

export interface WindReading {
  latitude: number;
  longitude: number;
  speed: number; // Wind speed in m/s
  direction: number; // Wind direction in degrees (0-360)
  gust?: number; // Wind gust in m/s (optional)
  timestamp: string;
}

export interface AirQualityGradientData {
  readings: AirQualityReading[];
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}

export interface WindData {
  readings: WindReading[];
  bounds: [number, number, number, number];
}

// Color scale for AQI visualization
export const AQI_COLOR_SCALE = {
  0: '#00e400', // Good (0-50)
  51: '#ffff00', // Moderate (51-100)
  101: '#ff7e00', // Unhealthy for Sensitive Groups (101-150)
  151: '#ff0000', // Unhealthy (151-200)
  201: '#8f3f97', // Very Unhealthy (201-300)
  301: '#7e0023', // Hazardous (301+)
};

// Generate mock air quality data
export function generateMockAirQualityData(
  bounds: [number, number, number, number],
  numPoints: number = 50
): AirQualityGradientData {
  const [minLng, minLat, maxLng, maxLat] = bounds;
  const readings: AirQualityReading[] = [];

  for (let i = 0; i < numPoints; i++) {
    const latitude = minLat + Math.random() * (maxLat - minLat);
    const longitude = minLng + Math.random() * (maxLng - minLng);

    // Create realistic AQI patterns (lower in rural areas, higher in cities)
    const baseAQI = 30 + Math.random() * 120; // Base range 30-150
    const urbanFactor = Math.random() > 0.7 ? 1.5 : 1; // 30% chance of urban pollution
    const aqi = Math.min(500, Math.floor(baseAQI * urbanFactor));

    readings.push({
      latitude,
      longitude,
      aqi,
      pm25: aqi * 0.4 + Math.random() * 10, // Rough correlation
      pm10: aqi * 0.6 + Math.random() * 15,
      o3: 20 + Math.random() * 80,
      no2: 10 + Math.random() * 60,
      so2: 5 + Math.random() * 25,
      timestamp: new Date().toISOString(),
    });
  }

  return { readings, bounds };
}

// Generate mock wind data
export function generateMockWindData(
  bounds: [number, number, number, number],
  numPoints: number = 30
): WindData {
  const [minLng, minLat, maxLng, maxLat] = bounds;
  const readings: WindReading[] = [];

  // Create prevailing wind patterns
  const prevailingDirection = 225 + (Math.random() - 0.5) * 90; // SW winds with variation

  for (let i = 0; i < numPoints; i++) {
    const latitude = minLat + Math.random() * (maxLat - minLat);
    const longitude = minLng + Math.random() * (maxLng - minLng);

    // Add some turbulence and local variations
    const direction = (prevailingDirection + (Math.random() - 0.5) * 60) % 360;
    const speed = 2 + Math.random() * 12; // 2-14 m/s
    const gust = speed + Math.random() * 5;

    readings.push({
      latitude,
      longitude,
      speed,
      direction,
      gust,
      timestamp: new Date().toISOString(),
    });
  }

  return { readings, bounds };
}

// Utility function to interpolate colors
export function interpolateColor(
  value: number,
  colorScale: Record<number, string>
): string {
  const keys = Object.keys(colorScale)
    .map(Number)
    .sort((a, b) => a - b);

  if (value <= keys[0]) return colorScale[keys[0]];
  if (value >= keys[keys.length - 1]) return colorScale[keys[keys.length - 1]];

  // Find surrounding keys
  let lowerKey = keys[0];
  let upperKey = keys[keys.length - 1];

  for (let i = 0; i < keys.length - 1; i++) {
    if (value >= keys[i] && value <= keys[i + 1]) {
      lowerKey = keys[i];
      upperKey = keys[i + 1];
      break;
    }
  }

  // Simple interpolation (could be enhanced with proper color space interpolation)
  const ratio = (value - lowerKey) / (upperKey - lowerKey);

  // For now, return the closer color (can be enhanced)
  return ratio < 0.5 ? colorScale[lowerKey] : colorScale[upperKey];
}
