const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getTickets: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== false))
    ).toString();
    return request(`/tickets${qs ? '?' + qs : ''}`);
  },
  createTicket: (body) => request('/tickets', { method: 'POST', body: JSON.stringify(body) }),
  updateTicket: (id, body) => request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTicket: (id) => request(`/tickets/${id}`, { method: 'DELETE' }),
  getStats: () => request('/tickets/stats'),
};
