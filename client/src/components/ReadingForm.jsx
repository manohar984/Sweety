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
  }, [editData, today]);

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
          <div className="modal-title-group">
            <h3 className="modal-title">{editData ? 'Edit Glucose Reading' : 'Log New Reading'}</h3>
            <p className="modal-subtitle">Record blood sugar level with slot and date</p>
          </div>
          <button
            className="modal-close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {(error || externalError) && (
          <div className="form-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error || externalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reading-form">
          <div className="form-group">
            <label htmlFor="rf-date">Reading date</label>
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
            <label htmlFor="rf-slot">Time of day / Slot</label>
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
            <label htmlFor="rf-glucose">
              Glucose value <span className="label-unit">(mg/dL)</span>
            </label>
            <div className="input-with-unit">
              <input
                id="rf-glucose"
                type="number"
                value={glucoseValue}
                min={40}
                max={600}
                step={1}
                placeholder="e.g. 105"
                onChange={(e) => setGlucoseValue(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <span className="input-unit-badge">mg/dL</span>
            </div>
            <span className="input-hint">Standard fasting target: 70–100 mg/dL · Post-meal: &lt;140 mg/dL</span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={loading}
            >
              {loading ? 'Saving…' : editData ? 'Save Changes' : 'Record Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReadingForm;
