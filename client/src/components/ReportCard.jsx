import './ReportCard.css';

function fmt(value) {
  if (value === null || value === undefined) return '—';
  return String(value);
}

function ReportCard({ title, report, loading, error }) {
  return (
    <div className="report-card">

      <div className="report-card-header">
        <h3 className="report-card-title">{title}</h3>

        {report && !loading && (
          <span className="report-period">{report.period}</span>
        )}
      </div>

      {loading && (
        <div className="report-loading">Loading…</div>
      )}

      {!loading && error && (
        <div className="report-error">{error}</div>
      )}

      {!loading && !error && report && (
        report.count === 0

          ? (
            <p className="report-empty">No readings recorded for this period.</p>
          )

          : (
            <div className="report-stats">
              <div className="stat-item">
                <span className="stat-label">Readings</span>
                <span className="stat-value stat-count">{report.count}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Min</span>
                <span className="stat-value">{fmt(report.min)}</span>
                <span className="stat-unit">mg/dL</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max</span>
                <span className="stat-value">{fmt(report.max)}</span>
                <span className="stat-unit">mg/dL</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average</span>
                <span className="stat-value">{fmt(report.average)}</span>
                <span className="stat-unit">mg/dL</span>
              </div>
            </div>
          )
      )}

    </div>
  );
}

export default ReportCard;
