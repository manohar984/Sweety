import { useState, useEffect } from 'react';
import './ReadingForm.css';

const SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ReadingForm({ editData, onSubmit, onCancel, loading, externalError }) {
  const today = getTodayString();

  const [glucoseValue, setGlucoseValue] = useState('');
  const [readingDate, setReadingDate] = useState(today);
  const [readingSlot, setReadingSlot] = useState(SLOTS[0]);

  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setGlucoseValue(String(editData.glucose_value));

      setReadingDate(editData.reading_date);
      setReadingSlot(editData.reading_slot);
    } else {
      setGlucoseValue('');
      setReadingDate(today);
      setReadingSlot(SLOTS[0]);
    }
    setError('');
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const glucose = Number(glucoseValue);
    if (glucoseValue === '' || isNaN(glucose) || !Number.isInteger(glucose)) {
      setError('Please enter a valid whole number.');
      return;
    }
    if (glucose < 40 || glucose > 600) {
      setError('Glucose value must be between 40 and 600 mg/dL.');
      return;
    }

    if (!readingDate) {
      setError('Please select a date.');
      return;
    }
    if (readingDate > today) {
      setError('Date cannot be in the future.');
      return;
    }

    onSubmit({
      glucose_value: glucose,
      reading_date: readingDate,
      reading_slot: readingSlot,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>

      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>{editData ? 'Edit Reading' : 'Add New Reading'}</h3>
          <button
            className="modal-close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {(error || externalError) && (
          <div className="form-error">{error || externalError}</div>
        )}

        <form onSubmit={handleSubmit} className="reading-form">

          <div className="form-group">
            <label htmlFor="rf-date">Date</label>
            <input
              id="rf-date"
              type="date"
              value={readingDate}
              max={today}
              onChange={(e) => setReadingDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rf-slot">Reading slot</label>

            <select
              id="rf-slot"
              value={readingSlot}
              onChange={(e) => setReadingSlot(e.target.value)}
              disabled={loading}
            >
              {SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rf-glucose">Glucose value (mg/dL)</label>
            <input
              id="rf-glucose"
              type="number"
              value={glucoseValue}
              min={40}
              max={600}
              step={1}
              placeholder="e.g. 95"
              onChange={(e) => setGlucoseValue(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving…' : editData ? 'Save changes' : 'Add reading'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReadingForm;
