import React from 'react';

/**
 * KPI card AgID-style.
 * - kpiColor: colore della striscia in cima (e default del valore) — es. 'var(--d-blue)'
 * - valueColor: override colore numero — utile per card semantiche (rosso se errori, grigio se 0)
 * - trend: nodo JSX opzionale con il badge tendenza
 * - trendDir: 'up' | 'down' | 'ok' | 'flat' | 'warn'
 */
function MetricCard({ title, value, kpiColor, valueColor, subtitle, trend, trendDir = 'flat' }) {
  return (
    <div className="dash-kpi" style={{ '--kpi-color': kpiColor }}>
      <div className="dash-kpi-lbl">{title}</div>
      <div className="dash-kpi-val" style={{ color: valueColor || kpiColor || 'var(--d-text)' }}>
        {value}
      </div>
      {subtitle && <div className="dash-kpi-desc">{subtitle}</div>}
      {trend && (
        <div className={`dash-kpi-trend ${trendDir}`}>
          {trend}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
