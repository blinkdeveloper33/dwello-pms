const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // API already has /api prefix, so don't add it again
  const url = endpoint.startsWith('/') 
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

