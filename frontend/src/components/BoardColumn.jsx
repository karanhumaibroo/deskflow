import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { TicketCard } from './TicketCard';
import { STATUS_COLORS } from '../utils/helpers';

export function BoardColumn({ status, label, tickets, onMove, onDelete }) {
  const color = STATUS_COLORS[status];

  return (
    <div className="board-column">
      <div className="column-header" style={{ borderTopColor: color }}>
        <span className="column-title" style={{ color }}>{label}</span>
        <span className="column-count">{tickets.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-body${snapshot.isDraggingOver ? ' drag-over' : ''}`}
          >
            {tickets.length === 0 && (
              <div className="empty-col">No tickets</div>
            )}
            {tickets.map((ticket, index) => (
              <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                {(prov, snap) => (
                  <TicketCard
                    ticket={ticket}
                    onMove={onMove}
                    onDelete={onDelete}
                    provided={prov}
                    snapshot={snap}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
