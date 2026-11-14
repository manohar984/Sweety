import './ReportCard.css';

function fmt(value) {
  if (value === null || value === undefined) return '—';
  return String(value);
}

function getAverageStatus(avg) {
  if (avg === null || avg === undefined) return '';
  if (avg < 70) return 'stat-val--low';
  if (avg <= 140) return 'stat-val--normal';
  if (avg <= 200) return 'stat-val--high';
  return 'stat-val--vhigh';
}

function ReportCard({ title, report, loading, error }) {
  return (
    <div className="report-card">
      <div className="report-card-header">
        <div className="report-title-group">
          <h4 className="report-card-title">{title}</h4>
          {report && !loading && (
            <span className="report-period">{report.period}</span>
          )}
        </div>
      </div>

      {loading && (
        <div className="report-loading">
          <div className="report-spinner" aria-hidden="true"></div>
          <span>Loading summary statistics…</span>
        </div>
      )}

      {!loading && error && (
        <div className="report-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && report && (
                report.count === 0 ? (
                <div className="report-empty">
                  <div className="empty-report-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p>No glucose readings recorded for this timeframe.</p>
                </div>
                ) : (
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Readings Count</span>
                    <div className="stat-val-box">
                      <span className="stat-value stat-count">{report.count}</span>
                      <span className="stat-unit">entries</span>
                    </div>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Lowest Value</span>
                      <div className="stat-val-box">
                        <span className="stat-value">{fmt(report.min)}</span>
                        <span className="stat-unit">mg/dL</span>
                      </div>
                      </div>

                      <div className="stat-item">
                        <span className="stat-label">Highest Value</span>
                        <div className="stat-val-box">
                          <span className="stat-value">{fmt(report.max)}</span>
                          <span className="stat-unit">mg/dL</span>
                        </div>
                        </div>

                        <div className="stat-item stat-item--featured">
                          <span className="stat-label">Average Glucose</span>
                          <div className="stat-val-box">
                            <span className={`stat-value ${getAverageStatus(report.average)}`}>
                              {fmt(report.average)}
                            </span>
                            <span className="stat-unit">mg/dL</span>
                          </div>
                        </div>
                      </div>
                      )
      )}
                    </div>
                    );
}

                    export default ReportCard;
