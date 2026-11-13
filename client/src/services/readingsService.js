import API_URL from './api';

const authHeader = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export async function getReadings(token) {
  const response = await fetch(`${API_URL}/api/readings`, {
    method: 'GET',
    headers: authHeader(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load readings.');
  return data.readings;
}

export async function createReading(token, data) {
  const response = await fetch(`${API_URL}/api/readings`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to add reading.');
  return result.reading;
}

export async function updateReading(token, id, data) {
  const response = await fetch(`${API_URL}/api/readings/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to update reading.');
  return result.reading;
}

export async function deleteReading(token, id) {
  const response = await fetch(`${API_URL}/api/readings/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to delete reading.');
  return result;
}
