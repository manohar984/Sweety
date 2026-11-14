import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReadings, createReading, updateReading, deleteReading } from '../services/readingsService';
import NavHeader   from '../components/NavHeader';
import ReadingForm  from '../components/ReadingForm';
import ReadingTable from '../components/ReadingTable';
import GlucoseChart from '../components/GlucoseChart';
import './Dashboard.css';

function getReadingStatus(val) {
  if (val < 70) return { label: 'Low', className: 'stat-pill--low' };
  if (val <= 140) return { label: 'In Range', className: 'stat-pill--normal' };
  if (val <= 200) return { label: 'High', className: 'stat-pill--high' };
  return { label: 'Very High', className: 'stat-pill--vhigh' };
}

function computeDashboardStats(readings) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthReadings = readings.filter((r) => {
    if (!r || !r.reading_date) return false;
    const parts = String(r.reading_date).split('T')[0].split('-');
    return Number(parts[0]) === currentYear && Number(parts[1]) === currentMonth + 1;
  });

  const latest = readings.length > 0 ? readings[0] : null;

  if (monthReadings.length === 0) {
    return {
      latest,
      average: null,
      count: 0,
      inRangePercent: null,
    };
  }

  const sum = monthReadings.reduce((acc, r) => acc + Number(r.glucose_value), 0);
  const avg = Math.round((sum / monthReadings.length) * 10) / 10;

  const inRangeCount = monthReadings.filter(
    (r) => Number(r.glucose_value) >= 70 && Number(r.glucose_value) <= 140
  ).length;
  const inRangePercent = Math.round((inRangeCount / monthReadings.length) * 100);

  return {
    latest,
    average: avg,
    count: monthReadings.length,
    inRangePercent,
  };
}

function DashboardPage() {
  const { token } = useAuth();

  const [readings, setReadings] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const fetchReadings = useCallback(async () => {
    setFetchLoading(true);
    setPageError('');
    try {
      const data = await getReadings(token);
      setReadings(data);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setFetchLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleAddClick = () => {
    setEditData(null);
    setFormError('');
    setShowForm(true);
  };

  const handleEditClick = (reading) => {
    setEditData(reading);
    setFormError('');
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditData(null);
    setFormError('');
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (editData) {
        await updateReading(token, editData.id, formData);
        showSuccess('Reading updated successfully.');
      } else {
        await createReading(token, formData);
        showSuccess('Reading logged successfully.');
      }
      setShowForm(false);
      setEditData(null);
      await fetchReadings();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm('Delete this reading? This cannot be undone.');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteReading(token, id);
      showSuccess('Reading deleted.');
      setReadings((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setPageError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => computeDashboardStats(readings), [readings]);

  return (
    <div className="dashboard">
      <NavHeader />

      <main className="dash-main">
        <div className="dash-hero">
          <div className="dash-hero-content">
            <h1 className="dash-title">Glucose Overview</h1>
            <p className="dash-subtitle">Track, monitor, and analyze your daily blood sugar trends</p>
          </div>
          <button
            id="add-reading-btn"
            className="btn-add"
            onClick={handleAddClick}
            disabled={fetchLoading}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Log Reading</span>
          </button>
        </div>

        {successMsg && (
          <div className="page-success" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {pageError && (
          <div className="page-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="error-content">
              <span>{pageError}</span>
              <button className="retry-link" onClick={fetchReadings}>Retry connection</button>
            </div>
          </div>
        )}

        <div className="dash-summary-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Latest Reading</span>
              <div className="stat-card-icon stat-card-icon--teal">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
            </div>
            <div className="stat-card-body">
              {stats.latest ? (
                <>
                  <div className="stat-card-val-row">
                    <span className="stat-card-value">{stats.latest.glucose_value}</span>
                    <span className="stat-card-unit">mg/dL</span>
                  </div>
                  <div className="stat-card-meta">
                    <span className={`stat-pill ${getReadingStatus(stats.latest.glucose_value).className}`}>
                      {getReadingStatus(stats.latest.glucose_value).label}
                    </span>
                    <span className="stat-meta-slot">{stats.latest.reading_slot}</span>
                  </div>
                </>
              ) : (
                <div className="stat-card-empty">No entries yet</div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Monthly Average</span>
              <div className="stat-card-icon stat-card-icon--emerald">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
            <div className="stat-card-body">
              {stats.average !== null ? (
                <>
                  <div className="stat-card-val-row">
                    <span className="stat-card-value">{stats.average}</span>
                    <span className="stat-card-unit">mg/dL</span>
                  </div>
                  <div className="stat-card-meta">
                    <span className="stat-meta-hint">Target: 70–140 mg/dL</span>
                  </div>
                </>
              ) : (
                <div className="stat-card-empty">No data this month</div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">In-Range Ratio</span>
              <div className="stat-card-icon stat-card-icon--blue">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="stat-card-body">
              {stats.inRangePercent !== null ? (
                <>
                  <div className="stat-card-val-row">
                    <span className="stat-card-value">{stats.inRangePercent}%</span>
                  </div>
                  <div className="stat-card-meta">
                    <span className="stat-meta-hint">70–140 mg/dL target</span>
                  </div>
                </>
              ) : (
                <div className="stat-card-empty">No data this month</div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Logged Readings</span>
              <div className="stat-card-icon stat-card-icon--slate">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <div className="stat-card-body">
              <div className="stat-card-val-row">
                <span className="stat-card-value">{stats.count}</span>
                <span className="stat-card-unit">this month</span>
              </div>
              <div className="stat-card-meta">
                <span className="stat-meta-hint">{readings.length} total recorded</span>
              </div>
            </div>
          </div>
        </div>

        <GlucoseChart
          readings={readings}
          loading={fetchLoading}
          error={pageError}
        />

        <div className="dash-table-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Log History</h2>
              <p className="section-subtitle">All recorded blood glucose entries sorted chronologically</p>
            </div>
          </div>

          {fetchLoading ? (
            <div className="table-loading-card">
              <div className="loading-spinner" aria-hidden="true"></div>
              <span>Loading your clinical readings…</span>
            </div>
          ) : (
            <ReadingTable
              readings={readings}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              deletingId={deletingId}
            />
          )}
        </div>
      </main>

      {showForm && (
        <ReadingForm
          editData={editData}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
          externalError={formError}
        />
      )}
    </div>
  );
}

export default DashboardPage;
