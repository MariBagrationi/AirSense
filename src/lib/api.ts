export interface GeoData {
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  aqi: number;
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    so2?: number;
    co?: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchApiInfo(): Promise<APIResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch API info:', error);
    return { success: false, data: {}, error: 'Failed to fetch API info' };
  }
}

export async function fetchHealthStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

export async function fetchGeoData(timestamp: string): Promise<APIResponse<GeoData[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/data?timestamp=${timestamp}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch geo data:', error);
    return { success: false, data: [], error: 'Failed to fetch geo data' };
  }
}

export async function fetchDataForRange(
  start: string,
  end: string
): Promise<APIResponse<GeoData[]>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/data/range?start=${start}&end=${end}`
    );
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch range data:', error);
    return { success: false, data: [], error: 'Failed to fetch range data' };
  }
}

export async function fetchStats(): Promise<APIResponse<{
  timeRange: { start: string; end: string };
  totalRecords: number;
  avgAQI: number;
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      success: false,
      data: { timeRange: { start: '', end: '' }, totalRecords: 0, avgAQI: 0 },
      error: 'Failed to fetch stats'
    };
  }
}