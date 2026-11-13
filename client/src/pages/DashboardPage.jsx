import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReadings, createReading, updateReading, deleteReading } from '../services/readingsService';
import NavHeader   from '../components/NavHeader';
import ReadingForm  from '../components/ReadingForm';
import ReadingTable from '../components/ReadingTable';
import './Dashboard.css';

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
    setTimeout(() => setSuccessMsg(''), 3000);
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
        showSuccess('Reading updated.');
      } else {
        await createReading(token, formData);
        showSuccess('Reading added.');
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

  return (
    <div className="dashboard">

      <NavHeader />

      <main className="dash-main">

        <div className="dash-toolbar">
          <h2 className="dash-title">My Glucose Readings</h2>
          <button
            id="add-reading-btn"
            className="btn-add"
            onClick={handleAddClick}
            disabled={fetchLoading}
          >
            + Add Reading
          </button>
        </div>

        {successMsg && (
          <div className="page-success" role="status">{successMsg}</div>
        )}

        {pageError && (
          <div className="page-error" role="alert">
            {pageError}
            <button className="retry-link" onClick={fetchReadings}>Retry</button>
          </div>
        )}

        {fetchLoading ? (
          <div className="loading-state">Loading your readings…</div>
        ) : (
          <ReadingTable
            readings={readings}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            deletingId={deletingId}
          />
        )}

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
