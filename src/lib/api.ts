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

const API_BASE_URL = 'http://localhost:8000';

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

// Chatbot API interfaces
export interface HealthQuery {
  question: string;
  context_variables?: { [key: string]: any } | null;
  user_id?: string | null;
}

export interface HealthResponse {
  status: string;
  recommendation: string;
  response_type: string;
  user_id?: string | null;
  processing_info?: { [key: string]: any } | null;
}

// Chatbot API functions
export async function sendChatMessage(message: string, userId?: string): Promise<APIResponse<HealthResponse>> {
  try {
    const body: HealthQuery = {
      question: message,
      user_id: userId || null
    };

    console.log('Sending request to:', `${API_BASE_URL}/health-advice`);
    console.log('Request body:', body);

    const response = await fetch(`${API_BASE_URL}/health-advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Response received:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- OK:', response.ok);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data: HealthResponse = await response.json();
    console.log('Success! Response data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ API ERROR DETAILS:');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error object:', error);
    
    // Check for specific error types
    let errorMessage = 'Failed to send chat message';
    if (error instanceof TypeError) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to API server. Check if the server is running on localhost:8000';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: API server needs to allow requests from localhost:3001';
      }
    } else if (error instanceof Error) {
      errorMessage = `API Error: ${error.message}`;
    }
    
    return {
      success: false,
      data: {
        status: 'error',
        recommendation: errorMessage,
        response_type: 'error'
      },
      error: errorMessage
    };
  }
}

export async function sendQuickChatMessage(question: string): Promise<APIResponse<string>> {
  try {
    const response = await fetch(`${API_BASE_URL}/quick-advice?question=${encodeURIComponent(question)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send quick chat message:', error);
    return {
      success: false,
      data: 'Sorry, I\'m having trouble connecting to the server. Please try again later.',
      error: 'Failed to send quick chat message'
    };
  }
}