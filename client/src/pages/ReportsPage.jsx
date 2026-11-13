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
        <h2 className="reports-title">Reports &amp; Summary</h2>

        <section className="report-section">
          <div className="report-section-header">
            <h3 className="report-section-label">Daily Report</h3>

            <div className="date-picker-group">
              <label htmlFor="daily-date">Select date:</label>
              <input
                id="daily-date"
                type="date"
                value={dailyDate}
                max={today}
                onChange={(e) => setDailyDate(e.target.value)}
              />
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
          <h3 className="report-section-label">Month to Date</h3>
          <ReportCard
            title="This Month"
            report={mtdReport}
            loading={mtdLoading}
            error={mtdError}
          />
        </section>

        <section className="report-section">
          <h3 className="report-section-label">Previous Month</h3>
          <ReportCard
            title="Last Month"
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
