import React from 'react';
import { PRIORITY_COLORS } from '../utils/helpers';

export function FiltersBar({ filters, onChange }) {
  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label>Priority</label>
        <select
          value={filters.priority || ''}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <label className="filter-toggle">
        <input
          type="checkbox"
          checked={!!filters.breached}
          onChange={(e) => onChange({ ...filters, breached: e.target.checked })}
        />
        <span className="toggle-label">⚠ SLA Breached only</span>
      </label>

      {(filters.priority || filters.breached) && (
        <button
          className="clear-filters"
          onClick={() => onChange({})}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
