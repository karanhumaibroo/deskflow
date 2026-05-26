import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useTickets } from './hooks/useTickets';
import { BoardColumn } from './components/BoardColumn';
import { CreateTicketModal } from './components/CreateTicketModal';
import { StatsStrip } from './components/StatsStrip';
import { FiltersBar } from './components/FiltersBar';
import { STATUSES, STATUS_LABELS, getAllowedTransitions } from './utils/helpers';
import './styles/global.css';

export default function App() {
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [dragError, setDragError] = useState('');

  const apiFilters = {
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.breached ? { breached: 'true' } : {}),
  };

  const { tickets, stats, loading, error, createTicket, moveTicket, deleteTicket } = useTickets(apiFilters);

  const ticketsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const fromStatus = source.droppableId;
    const toStatus = destination.droppableId;
    const allowed = getAllowedTransitions(fromStatus);

    if (!allowed.includes(toStatus)) {
      setDragError(`Cannot move from "${STATUS_LABELS[fromStatus]}" to "${STATUS_LABELS[toStatus]}" — only adjacent transitions allowed.`);
      setTimeout(() => setDragError(''), 3500);
      return;
    }

    try {
      await moveTicket(draggableId, toStatus);
    } catch (err) {
      setDragError(err.message);
      setTimeout(() => setDragError(''), 3500);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">DeskFlow</span>
          </div>
          <StatsStrip stats={stats} />
        </div>
        <button className="btn-create" onClick={() => setShowModal(true)}>
          + New Ticket
        </button>
      </header>

      {/* Filters */}
      <div className="toolbar">
        <FiltersBar filters={filters} onChange={setFilters} />
      </div>

      {/* Drag error */}
      {dragError && (
        <div className="drag-error-banner">
          ⚠ {dragError}
        </div>
      )}

      {/* Board */}
      <main className="board-area">
        {loading && <div className="full-loading">Loading tickets…</div>}
        {error && <div className="full-error">Error: {error}</div>}
        {!loading && !error && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
              {STATUSES.map((status) => (
                <BoardColumn
                  key={status}
                  status={status}
                  label={STATUS_LABELS[status]}
                  tickets={ticketsByStatus[status]}
                  onMove={moveTicket}
                  onDelete={deleteTicket}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Create modal */}
      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreate={createTicket}
        />
      )}
    </div>
  );
}
