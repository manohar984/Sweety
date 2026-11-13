import API_URL from './api';

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed. Please try again.');
  }

  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed. Please try again.');
  }

  return data;
}
