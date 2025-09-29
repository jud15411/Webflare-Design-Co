// TimeLogsPage/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import '../../App.css';
import './TimeLogsPage.css';

// --- Type Definitions ---
interface ITimeLog {
  _id: string;
  user: string;
  clockInTime: string;
  clockOutTime?: string;
  duration?: number;
  isApprovedOverride?: boolean;
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

interface ApiError {
  message: string;
}

// --- Component ---
const TimeLogsPage: React.FC = () => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      // setLoading is handled in the useEffect that calls this
      const response = await API.get<StatusData>('/timelogs/status');
      setStatus(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ||
        'Failed to fetch your time log status.';
      setError(message);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true);
      await fetchStatus();
      setLoading(false);
    };
    loadStatus();
  }, [fetchStatus]);

  const handleClockIn = async () => {
    setError(null);
    try {
      await API.post('/timelogs/clock-in');
      await fetchStatus(); // Refresh status after clocking in
    } catch (err: any) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to clock in.';
      setError(message);
    }
  };

  const handleClockOut = async () => {
    setError(null);
    try {
      await API.post('/timelogs/clock-out');
      await fetchStatus(); // Refresh status after clocking out
    } catch (err: any) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to clock out.';
      setError(message);
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
              <p>
                <strong>Start:</strong>{' '}
                {formatDate(status.upcomingSchedule.startTime)}
              </p>
              <p>
                <strong>End:</strong>{' '}
                {formatDate(status.upcomingSchedule.endTime)}
              </p>
              {status.upcomingSchedule.notes && (
                <p className="notes">
                  <strong>Notes:</strong> {status.upcomingSchedule.notes}
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