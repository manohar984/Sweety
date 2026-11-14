import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import './GlucoseChart.css';

const SLOT_ORDER = {
  'Morning (fasting)': 1,
  'After breakfast': 2,
  'After lunch': 3,
  'After dinner': 4,
};

const SLOT_SHORT = {
  'Morning (fasting)': 'Fasting',
  'After breakfast': 'Post-BF',
  'After lunch': 'Post-Lunch',
  'After dinner': 'Post-Dinner',
};

function getCurrentMonthInfo() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    label: now.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    }),
  };
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getReadingStatus(val) {
  if (val < 70) return { label: 'Low', className: 'tooltip-status--low' };
  if (val <= 140) return { label: 'In Range', className: 'tooltip-status--normal' };
  if (val <= 200) return { label: 'High', className: 'tooltip-status--high' };
  return { label: 'Very High', className: 'tooltip-status--vhigh' };
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const status = getReadingStatus(data.glucose_value);

    return (
      <div className="chart-tooltip">
        <div className="tooltip-header">
          <span className="tooltip-date">{data.fullDate}</span>
          <span className="tooltip-slot">{data.slot}</span>
        </div>
        <div className="tooltip-body">
          <div className="tooltip-val-row">
            <span className="tooltip-value">{data.glucose_value}</span>
            <span className="tooltip-unit">mg/dL</span>
          </div>
          <span className={`tooltip-status ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

function GlucoseChart({ readings = [], loading = false, error = '' }) {
  const { year: currentYear, month: currentMonth, label: monthLabel } = useMemo(
    () => getCurrentMonthInfo(),
    []
  );

  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-header-left">
            <h3 className="chart-title">Monthly Glucose Trend</h3>
            <span className="chart-period">{monthLabel}</span>
          </div>
        </div>
        <div className="chart-loading-state">
          <div className="chart-spinner" aria-hidden="true"></div>
          <span>Loading monthly trend…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-header-left">
            <h3 className="chart-title">Monthly Glucose Trend</h3>
            <span className="chart-period">{monthLabel}</span>
          </div>
        </div>
        <div className="chart-error-state">{error}</div>
      </div>
    );
  }

  const currentMonthReadings = readings.filter((r) => {
    if (!r || !r.reading_date) return false;
    const dateStr = typeof r.reading_date === 'string'
      ? r.reading_date.split('T')[0]
      : '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return false;
    return Number(parts[0]) === currentYear && Number(parts[1]) === currentMonth + 1;
  });

  const sortedReadings = [...currentMonthReadings].sort((a, b) => {
    const dateA = typeof a.reading_date === 'string' ? a.reading_date.split('T')[0] : '';
    const dateB = typeof b.reading_date === 'string' ? b.reading_date.split('T')[0] : '';
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    const slotA = SLOT_ORDER[a.reading_slot] || 5;
    const slotB = SLOT_ORDER[b.reading_slot] || 5;
    return slotA - slotB;
  });

  const chartData = sortedReadings.map((r, index) => {
    const dateStr = typeof r.reading_date === 'string' ? r.reading_date.split('T')[0] : '';
    const glucoseNum = Number(r.glucose_value);
    const slotShort = SLOT_SHORT[r.reading_slot] || r.reading_slot;
    return {
      id: r.id || index,
      xLabel: formatShortDate(dateStr) + ' · ' + slotShort,
      date: formatShortDate(dateStr),
      fullDate: formatFullDate(dateStr),
      slot: r.reading_slot,
      glucose_value: isNaN(glucoseNum) ? null : glucoseNum,
    };
  });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-header-left">
          <h3 className="chart-title">Monthly Glucose Trend</h3>
          <span className="chart-period">{monthLabel}</span>
        </div>
        <div className="chart-target-badge">
          <span className="target-dot" aria-hidden="true"></span>
          <span>Target: 70–140 mg/dL</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="chart-empty-state">
          <div className="empty-icon-wrap" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <p className="empty-title">No readings recorded this month</p>
          <p className="empty-hint">Use &ldquo;Log Reading&rdquo; above to record your glucose values and see trend lines.</p>
        </div>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.filter(d => d.glucose_value !== null)}
              margin={{ top: 16, right: 20, left: -4, bottom: 56 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="xLabel"
                stroke="#cbd5e1"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={56}
              />
              <YAxis
                stroke="#cbd5e1"
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                unit=" mg/dL"
                width={74}
                domain={([dataMin, dataMax]) => {
                  const lo = Math.min(dataMin, 70) - 10;
                  const hi = Math.max(dataMax, 140) + 10;
                  return [Math.max(0, Math.floor(lo / 10) * 10), Math.ceil(hi / 10) * 10];
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={140} stroke="#cbd5e1" strokeDasharray="3 3" />
              <ReferenceLine y={70} stroke="#cbd5e1" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="glucose_value"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default GlucoseChart;
