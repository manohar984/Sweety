import './ReadingTable.css';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getValueMeta(value) {
  if (value < 70) {
    return { label: 'Low', className: 'value-pill--low' };
  }
  if (value <= 140) {
    return { label: 'In Range', className: 'value-pill--normal' };
  }
  if (value <= 200) {
    return { label: 'High', className: 'value-pill--high' };
  }
  return { label: 'Very High', className: 'value-pill--vhigh' };
}

function ReadingTable({ readings, onEdit, onDelete, deletingId }) {
  if (readings.length === 0) {
    return (
      <div className="table-empty-card">
        <div className="empty-table-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <p className="empty-table-title">No glucose readings recorded yet</p>
        <p className="empty-table-hint">Click &ldquo;Log Reading&rdquo; above to create your first entry and begin tracking.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="readings-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Glucose Value</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => {
              const meta = getValueMeta(reading.glucose_value);
              const isDeleting = deletingId === reading.id;

              return (
                <tr key={reading.id}>
                  <td className="cell-date">
                    <span className="date-text">{formatDate(reading.reading_date)}</span>
                  </td>
                  <td className="cell-slot">
                    <span className="slot-pill">{reading.reading_slot}</span>
                  </td>
                  <td className="cell-value">
                    <div className={`value-pill ${meta.className}`}>
                      <span className="value-dot" aria-hidden="true"></span>
                      <span className="value-number">{reading.glucose_value}</span>
                      <span className="value-unit">mg/dL</span>
                      <span className="value-tag">{meta.label}</span>
                    </div>
                  </td>
                  <td className="cell-actions">
                    <div className="actions-group">
                      <button
                        className="btn-action btn-action--edit"
                        onClick={() => onEdit(reading)}
                        disabled={isDeleting}
                        aria-label={`Edit reading from ${formatDate(reading.reading_date)}`}
                        title="Edit reading"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn-action btn-action--delete"
                        onClick={() => onDelete(reading.id)}
                        disabled={isDeleting}
                        aria-label={`Delete reading from ${formatDate(reading.reading_date)}`}
                        title="Delete reading"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>{isDeleting ? '…' : 'Delete'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReadingTable;
