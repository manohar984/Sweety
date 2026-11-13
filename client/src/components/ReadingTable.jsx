import './ReadingTable.css';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getValueClass(value) {
  if (value < 70)  return 'value-low';
  if (value <= 140) return 'value-normal';
  if (value <= 200) return 'value-high';
  return 'value-very-high';
}

function ReadingTable({ readings, onEdit, onDelete, deletingId }) {
  if (readings.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <p>No readings yet.</p>
        <p className="empty-hint">Click <strong>Add Reading</strong> to log your first entry.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="readings-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Slot</th>
            <th>Value (mg/dL)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td>{formatDate(reading.reading_date)}</td>
              <td>
                <span className="slot-badge">{reading.reading_slot}</span>
              </td>
              <td>

                <span className={`value-badge ${getValueClass(reading.glucose_value)}`}>
                  {reading.glucose_value}
                </span>
              </td>
              <td className="actions-cell">
                <button
                  className="btn-edit"
                  onClick={() => onEdit(reading)}

                  disabled={deletingId === reading.id}
                  aria-label={`Edit reading from ${formatDate(reading.reading_date)}`}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(reading.id)}
                  disabled={deletingId === reading.id}
                  aria-label={`Delete reading from ${formatDate(reading.reading_date)}`}
                >
                  {deletingId === reading.id ? '…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReadingTable;
