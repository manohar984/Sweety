import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} from '../services/reportsService';
import NavHeader  from '../components/NavHeader';
import ReportCard from '../components/ReportCard';
import './ReportsPage.css';

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ReportsPage() {
  const { token } = useAuth();
  const today = getTodayString();

  const [dailyDate,    setDailyDate] = useState(today);
  const [dailyReport,  setDailyReport] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError,   setDailyError] = useState('');

  const [mtdReport,  setMtdReport] = useState(null);
  const [mtdLoading, setMtdLoading] = useState(true);
  const [mtdError,   setMtdError] = useState('');

  const [prevReport,  setPrevReport] = useState(null);
  const [prevLoading, setPrevLoading] = useState(true);
  const [prevError,   setPrevError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setDailyLoading(true);
      setDailyError('');
      try {
        const report = await getDailyReport(token, dailyDate);
        setDailyReport(report);
      } catch (err) {
        setDailyError(err.message);
      } finally {
        setDailyLoading(false);
      }
    };
    fetch();
  }, [token, dailyDate]);

  useEffect(() => {
    const fetchMtd = async () => {
      setMtdLoading(true);
      setMtdError('');
      try {
        setMtdReport(await getMonthToDateReport(token));
      } catch (err) {
        setMtdError(err.message);
      } finally {
        setMtdLoading(false);
      }
    };

    const fetchPrev = async () => {
      setPrevLoading(true);
      setPrevError('');
      try {
        setPrevReport(await getPreviousMonthReport(token));
      } catch (err) {
        setPrevError(err.message);
      } finally {
        setPrevLoading(false);
      }
    };

    fetchMtd();
    fetchPrev();
  }, [token]);

  return (
    <div className="reports-page">
      <NavHeader />

      <main className="reports-main">
        <div className="reports-hero">
          <h1 className="reports-title">Clinical Reports</h1>
          <p className="reports-subtitle">Statistical analysis and aggregated glucose summaries across key timeframes</p>
        </div>

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Daily Breakdown</span>
            </div>

            <div className="date-picker-group">
              <label htmlFor="daily-date">Select date:</label>
              <div className="date-input-wrap">
                <input
                  id="daily-date"
                  type="date"
                  value={dailyDate}
                  max={today}
                  onChange={(e) => setDailyDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <ReportCard
            title="Daily Summary"
            report={dailyReport}
            loading={dailyLoading}
            error={dailyError}
          />
        </section>

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Current Month</span>
            </div>
          </div>
          <ReportCard
            title="Month to Date"
            report={mtdReport}
            loading={mtdLoading}
            error={mtdError}
          />
        </section>

        <section className="report-section">
          <div className="report-section-header">
            <div className="report-section-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Historical Period</span>
            </div>
          </div>
          <ReportCard
            title="Previous Month"
            report={prevReport}
            loading={prevLoading}
            error={prevError}
          />
        </section>
      </main>
    </div>
  );
}

export default ReportsPage;
