// SchedulesPage.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import API from '../../utils/axios'; // Import the new axios instance
import { AxiosError } from 'axios'; // Import AxiosError for better error typing
import '../../App.css';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import './SchedulesPage.css';

// --- Type Definitions ---
interface Schedule {
  _id: string;
  user: { _id: string; name: string };
  startTime: string;
  endTime: string;
  status: 'Draft' | 'Published';
  notes?: string;
}

interface StaffUser {
  _id: string;
  name: string;
}

interface ApiError {
  message: string;
}

export const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);

  const [newSchedule, setNewSchedule] = useState({
    user: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  // --- Helper Functions ---
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- Effects and Data Fetching ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [schedulesRes, usersRes] = await Promise.all([
          API.get<Schedule[]>('/schedules'),
          API.get<StaffUser[]>('/users'),
        ]);

        // Sort schedules by startTime descending (most recent first)
        const sortedSchedules = schedulesRes.data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        setSchedules(sortedSchedules);
        setUsers(usersRes.data);

        if (usersRes.data.length > 0 && !newSchedule.user) {
          setNewSchedule((prev) => ({ ...prev, user: usersRes.data[0]._id }));
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const message =
          axiosError.response?.data?.message || 'Failed to fetch schedule data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [refresh]); // Refreshes when `refresh` state changes

  // --- Event Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleCreateSchedule = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const scheduleToSend = {
        ...newSchedule,
        startTime: new Date(newSchedule.startTime).toISOString(),
        endTime: new Date(newSchedule.endTime).toISOString(),
      };

      await API.post('/schedules', scheduleToSend);

      setNewSchedule({
        user: users[0]?._id || '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      setRefresh((prev) => !prev); // Trigger re-fetch
    } catch (err: any) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to create the schedule.';
      setError(message);
    }
  };

  const handleSelectSchedule = (scheduleId: string) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleConfirmPublish = async () => {
    if (selectedScheduleIds.length === 0) return;
    setError(null);
    try {
      await API.patch('/schedules/publish', {
        scheduleIds: selectedScheduleIds,
      });

      setSelectedScheduleIds([]);
      setIsPublishModalOpen(false);
      setRefresh((prev) => !prev); // Trigger re-fetch
    } catch (err: any) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message || 'Failed to publish schedules.';
      setError(message);
    }
  };
  
  const handleSelectAllDrafts = () => {
    const draftIds = schedules
      .filter(schedule => schedule.status === 'Draft')
      .map(schedule => schedule._id);

    setSelectedScheduleIds(draftIds);
  };

  // --- Render Method ---
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Team Schedules</h1>
      </div>
      {error && <p className="error-message">{error}</p>}

      <div className="schedules-page-grid">
        {/* --- Create New Schedule Panel (Left/Top) --- */}
        <div className="schedule-form-panel">
          <h2>Create New Schedule</h2>
          <form onSubmit={handleCreateSchedule}>
            <div className="form-group">
              <label htmlFor="user">Assign To</label>
              <select
                name="user"
                value={newSchedule.user}
                onChange={handleInputChange}
                required>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group form-group-half">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={newSchedule.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group form-group-half">
              <label htmlFor="endTime">End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={newSchedule.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                name="notes"
                value={newSchedule.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <button type="submit" className="create-schedule-btn">
              Create Schedule
            </button>
          </form>
        </div>

        {/* --- Schedules List Panel (Right/Bottom) --- */}
        <div className="schedules-list-panel">
          <div className="schedules-list-header">
            <h2>Upcoming Schedules</h2>
            <div className="schedule-actions">
              <button 
                className="select-all-drafts-btn"
                onClick={handleSelectAllDrafts}
              >
                Select All Drafts
              </button>
              <button
                className="publish-schedules-btn"
                onClick={() => setIsPublishModalOpen(true)}
                disabled={selectedScheduleIds.length === 0}>
                Publish Selected ({selectedScheduleIds.length})
              </button>
            </div>
          </div>

          {loading ? (
            <p className="loading-message">Loading schedules...</p>
          ) : schedules.length > 0 ? (
            <div className="schedules-table-container">
              <table className="schedules-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Staff Member</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th className="notes-column">Notes</th>
                    <th className="status-column">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr 
                      key={schedule._id} 
                      className={schedule.status.toLowerCase()}
                      onClick={() => schedule.status !== 'Published' && handleSelectSchedule(schedule._id)}
                    >
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedScheduleIds.includes(schedule._id)}
                          onChange={() => handleSelectSchedule(schedule._id)}
                          disabled={schedule.status === 'Published'}
                        />
                      </td>
                      <td>{schedule.user.name}</td>
                      <td>
                        <span className="date-display">{formatDate(schedule.startTime)}</span>
                        <span className="time-display">{formatTime(schedule.startTime)}</span>
                      </td>
                      <td>
                        <span className="date-display">{formatDate(schedule.endTime)}</span>
                        <span className="time-display">{formatTime(schedule.endTime)}</span>
                      </td>
                      <td className="notes-column">{schedule.notes || '—'}</td>
                      <td className="status-column">
                        <span
                          className={`status-badge status-${schedule.status.toLowerCase()}`}>
                          {schedule.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-schedules-message">No schedules found.</p>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        title="Confirm Publish"
        message={`Are you sure you want to publish the ${selectedScheduleIds.length} selected schedule(s)?`}
        confirmText="Publish"
        variant="primary"
      />
    </div>
  );
};