import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useTickets(filters = {}) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketData, statsData] = await Promise.all([
        api.getTickets(filters),
        api.getStats(),
      ]);
      setTickets(ticketData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createTicket = async (data) => {
    const ticket = await api.createTicket(data);
    setTickets((prev) => [ticket, ...prev]);
    // Refresh stats
    api.getStats().then(setStats).catch(console.error);
    return ticket;
  };

  const moveTicket = async (id, newStatus) => {
    const updated = await api.updateTicket(id, { status: newStatus });
    setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
    api.getStats().then(setStats).catch(console.error);
    return updated;
  };

  const deleteTicket = async (id) => {
    await api.deleteTicket(id);
    setTickets((prev) => prev.filter((t) => t._id !== id));
    api.getStats().then(setStats).catch(console.error);
  };

  return { tickets, stats, loading, error, refetch: fetchAll, createTicket, moveTicket, deleteTicket };
}
