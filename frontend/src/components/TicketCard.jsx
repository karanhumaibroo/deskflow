import React, { useState } from 'react';
import { PRIORITY_COLORS, getAllowedTransitions, STATUS_LABELS, formatAge } from '../utils/helpers';

export function TicketCard({ ticket, onMove, onDelete, provided, snapshot }) {
  const [moving, setMoving] = useState(false);
  const [snapError, setSnapError] = useState('');
  const allowed = getAllowedTransitions(ticket.status);

  const handleMove = async (status) => {
    setMoving(true);
    setSnapError('');
    try {
      await onMove(ticket._id, status);
    } catch (err) {
      setSnapError(err.message);
      setTimeout(() => setSnapError(''), 3000);
    } finally {
      setMoving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await onDelete(ticket._id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      className={`ticket-card${ticket.slaBreached ? ' breached' : ''}${snapshot?.isDragging ? ' dragging' : ''}`}
    >
      {ticket.slaBreached && (
        <div className="sla-badge">⚠ SLA BREACHED</div>
      )}

      <div className="ticket-header">
        <span
          className="priority-badge"
          style={{ background: PRIORITY_COLORS[ticket.priority] + '22', color: PRIORITY_COLORS[ticket.priority], borderColor: PRIORITY_COLORS[ticket.priority] + '55' }}
        >
          {ticket.priority.toUpperCase()}
        </span>
        <span className="ticket-age">{formatAge(ticket.ageMinutes)}</span>
      </div>

      <h3 className="ticket-subject">{ticket.subject}</h3>
      <p className="ticket-email">{ticket.customerEmail}</p>

      {snapError && <div className="snap-error">{snapError}</div>}

      <div className="ticket-actions">
        {allowed.map((s) => (
          <button
            key={s}
            className={`move-btn ${s.includes('open') || s.includes('in_progress') && ticket.status === 'resolved' ? 'move-back' : 'move-fwd'}`}
            onClick={() => handleMove(s)}
            disabled={moving}
          >
            {moving ? '…' : `→ ${STATUS_LABELS[s]}`}
          </button>
        ))}
        <button className="delete-btn" onClick={handleDelete} title="Delete ticket">✕</button>
      </div>
    </div>
  );
}
