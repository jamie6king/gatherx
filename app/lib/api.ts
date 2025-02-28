export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // Merge the authorization header with existing headers
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // Make the request with the authorization header
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // This ensures cookies are sent with the request
  });

  return response;
} 