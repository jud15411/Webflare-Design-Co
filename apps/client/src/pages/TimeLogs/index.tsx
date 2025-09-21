import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';
import './TimeLogsPage.css';

interface ITimeLog {
  _id: string;
  user: string;
  clockInTime: string;
  clockOutTime?: string;
  duration?: number;
  isApprovedOverride?: boolean; // ADDED TO MATCH BACKEND MODEL
}

interface ISchedule {
  _id: string;
  startTime: string;
  endTime: string;
  status: 'Draft' | 'Published';
  notes?: string;
}

interface StatusData {
  isClockedIn: boolean;
  activeTimeLog?: string;
  recentLogs: ITimeLog[];
  upcomingSchedule?: ISchedule;
}

const TimeLogsPage: React.FC = () => {
  const { token } = useAuth(); // REMOVED 'user' AS IT'S UNUSED
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch('/api/v1/timelogs/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch status.');
      const data: StatusData = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const handleClockIn = async () => {
    try {
      const response = await fetch('/api/v1/timelogs/clock-in', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await fetch('/api/v1/timelogs/clock-out', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message);
      }
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading || !status) {
    // COMBINED LOADING AND NULL CHECK
    return <div className="time-logs-page-container">Loading...</div>;
  }

  return (
    <div className="time-logs-page-container">
      <header className="page-header">
        <h1>Time Tracking</h1>
      </header>
      <main className="time-logs-main">
        {error && <p className="error-message">{error}</p>}
        <div className="status-card-grid">
          <div className="status-card">
            <h3>My Status</h3>
            <p className="status-text">
              {status.isClockedIn ? 'Clocked In' : 'Clocked Out'}
            </p>
            <div className="action-buttons">
              {!status.isClockedIn ? (
                <button onClick={handleClockIn} className="clock-in-button">
                  Clock In
                </button>
              ) : (
                <button onClick={handleClockOut} className="clock-out-button">
                  Clock Out
                </button>
              )}
            </div>
          </div>
          {status.upcomingSchedule && (
            <div className="upcoming-schedule-card">
              <h3>Upcoming Schedule</h3>
              <p>**Start:** {formatDate(status.upcomingSchedule.startTime)}</p>
              <p>**End:** {formatDate(status.upcomingSchedule.endTime)}</p>
              {status.upcomingSchedule.notes && (
                <p className="notes">
                  **Notes:** {status.upcomingSchedule.notes}
                </p>
              )}
            </div>
          )}
        </div>

        <section className="recent-logs-section">
          <h2>Recent Time Logs</h2>
          {status.recentLogs.length > 0 ? (
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Duration (mins)</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {status.recentLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{formatDate(log.clockInTime)}</td>
                    <td>
                      {log.clockOutTime ? formatDate(log.clockOutTime) : 'N/A'}
                    </td>
                    <td>{log.duration || 'N/A'}</td>
                    <td>{log.isApprovedOverride ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent time logs found.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default TimeLogsPage;
