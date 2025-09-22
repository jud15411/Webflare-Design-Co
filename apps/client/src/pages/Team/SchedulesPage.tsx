import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';
import './SchedulesPage.css';

// Define the types from your backend model
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

export const SchedulesPage: React.FC = () => {
  const { token } = useAuth();
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

  // More compact date/time formatters
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

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const [schedulesRes, usersRes] = await Promise.all([
          fetch('/api/v1/schedules', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/v1/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const schedulesData = await schedulesRes.json();
        const usersData = await usersRes.json();

        if (!schedulesRes.ok)
          throw new Error(
            schedulesData.message || 'Failed to fetch schedules.'
          );
        if (!usersRes.ok)
          throw new Error(usersData.message || 'Failed to fetch users.');

        setSchedules(schedulesData);
        setUsers(usersData);
        if (usersData.length > 0 && !newSchedule.user) {
          setNewSchedule((prev) => ({ ...prev, user: usersData[0]._id }));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token, refresh]);

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

      const response = await fetch('/api/v1/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleToSend),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create schedule.');
      }
      setNewSchedule({
        user: users[0]?._id || '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      setRefresh((prev) => !prev);
    } catch (err: any) {
      setError(err.message);
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
      const response = await fetch('/api/v1/schedules/publish', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduleIds: selectedScheduleIds }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to publish schedules.');
      }
      setSelectedScheduleIds([]);
      setIsPublishModalOpen(false);
      setRefresh((prev) => !prev);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Team Schedules</h1>
      </div>
      {error && <p className="error-message">{error}</p>}

      {/* --- Form is now a standalone card --- */}
      <div className="schedule-form-card">
        <h2>Create New Schedule</h2>
        <form onSubmit={handleCreateSchedule}>
          <div className="form-grid">
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
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={newSchedule.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={newSchedule.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                name="notes"
                value={newSchedule.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          <button type="submit" className="create-schedule-btn">
            Create Schedule
          </button>
        </form>
      </div>

      {/* --- Schedules List section --- */}
      <div className="schedules-list-container">
        <div className="schedules-list-header">
          <h2>Upcoming Schedules</h2>
          <button
            className="publish-schedules-btn"
            onClick={() => setIsPublishModalOpen(true)}
            disabled={selectedScheduleIds.length === 0}>
            Publish Selected ({selectedScheduleIds.length})
          </button>
        </div>

        {loading ? (
          <p>Loading schedules...</p>
        ) : schedules.length > 0 ? (
          <div className="schedules-grid">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className={`schedule-card ${schedule.status.toLowerCase()}`}>
                <div className="card-selection">
                  <input
                    type="checkbox"
                    checked={selectedScheduleIds.includes(schedule._id)}
                    onChange={() => handleSelectSchedule(schedule._id)}
                    disabled={schedule.status === 'Published'}
                  />
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <span className="user-name">{schedule.user.name}</span>
                    <span
                      className={`status-badge status-${schedule.status.toLowerCase()}`}>
                      {schedule.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="time-info">
                      <div className="time-block">
                        <label>Starts</label>
                        <span>{formatDate(schedule.startTime)}</span>
                        <span>{formatTime(schedule.startTime)}</span>
                      </div>
                      <div className="time-arrow">→</div>
                      <div className="time-block">
                        <label>Ends</label>
                        <span>{formatDate(schedule.endTime)}</span>
                        <span>{formatTime(schedule.endTime)}</span>
                      </div>
                    </div>
                    {schedule.notes && (
                      <div className="notes-info">
                        <label>Notes</label>
                        <p>{schedule.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-projects-message">No schedules found.</p>
        )}
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

export default SchedulesPage;
