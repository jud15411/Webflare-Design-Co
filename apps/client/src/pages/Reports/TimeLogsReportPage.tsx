import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './TimeLogsReportPage.css';

// Define interfaces for our data
interface TimeLog {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  clockInTime: string;
  clockOutTime?: string;
  duration?: number;
  isApprovedOverride: boolean;
}

interface User {
  _id: string;
  name: string;
}

export const TimeLogsReportPage: React.FC = () => {
  const { token } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
  });

  // Fetch users for the filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get(`/api/v1/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, [token]);

  // Fetch time logs based on filters
  useEffect(() => {
    const fetchTimeLogs = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/v1/timelogs/reports`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            userId: filters.userId || undefined,
          },
        });
        setTimeLogs(data);
      } catch (err) {
        setError('Failed to fetch time logs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeLogs();
  }, [token, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalHours = (logs: TimeLog[]) => {
    const totalMinutes = logs.reduce(
      (acc, log) => acc + (log.duration || 0),
      0
    );
    return (totalMinutes / 60).toFixed(2);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Time Log Reports</h1>
      </div>

      <div className="report-filters card">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="userId">Employee</label>
          <select
            id="userId"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}>
            <option value="">All Employees</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="report-summary">
          <h3>Total Hours Recorded: {calculateTotalHours(timeLogs)}</h3>
        </div>
        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="table-container">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Duration (Minutes)</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {timeLogs.length > 0 ? (
                  timeLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{log.user.name}</td>
                      <td>{new Date(log.clockInTime).toLocaleString()}</td>
                      <td>
                        {log.clockOutTime
                          ? new Date(log.clockOutTime).toLocaleString()
                          : 'Still Clocked In'}
                      </td>
                      <td>{log.duration || 'N/A'}</td>
                      <td>{log.isApprovedOverride ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      No time logs found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
