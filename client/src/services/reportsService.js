import API_URL from './api';

const authHeader = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export async function getDailyReport(token, date = null) {
  const url = date
    ? `${API_URL}/api/reports/daily?date=${date}`
    : `${API_URL}/api/reports/daily`;

  const response = await fetch(url, { headers: authHeader(token) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load daily report.');
  return data.report;
}

export async function getMonthToDateReport(token) {
  const response = await fetch(`${API_URL}/api/reports/month-to-date`, {
    headers: authHeader(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load month-to-date report.');
  return data.report;
}

export async function getPreviousMonthReport(token) {
  const response = await fetch(`${API_URL}/api/reports/previous-month`, {
    headers: authHeader(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to load previous month report.');
  return data.report;
}
