import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/helpers';

export function StatsStrip({ stats }) {
  if (!stats) return <div className="stats-strip loading-strip">Loading stats…</div>;

  return (
    <div className="stats-strip">
      {Object.entries(stats.byStatus).map(([status, count]) => (
        <div key={status} className="stat-item">
          <span className="stat-dot" style={{ background: STATUS_COLORS[status] }} />
          <span className="stat-label">{STATUS_LABELS[status]}</span>
          <span className="stat-count">{count}</span>
        </div>
      ))}
      <div className="stat-item stat-breached">
        <span className="stat-dot" style={{ background: '#ef4444' }} />
        <span className="stat-label">SLA Breached</span>
        <span className="stat-count">{stats.breachedOpen}</span>
      </div>
    </div>
  );
}
