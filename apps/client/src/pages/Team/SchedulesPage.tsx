import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css'; // Import global styles
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

  // State for the "Add Schedule" form
  const [newSchedule, setNewSchedule] = useState({
    user: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  // State for the publish confirmation modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  // Helper function to format date
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

  // Fetch schedules and users on initial load and on refresh
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
        // Set the default user for the form to the first user in the list
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
      const response = await fetch('/api/v1/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSchedule),
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
    if (selectedScheduleIds.length === 0) {
      alert('Please select at least one schedule to publish.');
      return;
    }
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
      <div className="team-management-layout">
        <div className="add-user-card">
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
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                name="notes"
                value={newSchedule.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <button type="submit" className="add-user-button">
              Create Schedule
            </button>
          </form>
        </div>
        <div className="team-list-card">
          <div className="page-header" style={{ marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '0' }}>Upcoming Schedules</h2>
            <button
              className="add-user-button"
              onClick={() => setIsPublishModalOpen(true)}
              disabled={selectedScheduleIds.length === 0}
              style={{ padding: '8px 16px' }}>
              Publish Selected
            </button>
          </div>
          {loading ? (
            <p>Loading schedules...</p>
          ) : schedules.length > 0 ? (
            <div className="table-container">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>User</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedScheduleIds.includes(schedule._id)}
                          onChange={() => handleSelectSchedule(schedule._id)}
                          disabled={schedule.status === 'Published'}
                        />
                      </td>
                      <td>{schedule.user.name}</td>
                      <td>{formatDate(schedule.startTime)}</td>
                      <td>{formatDate(schedule.endTime)}</td>
                      <td>{schedule.notes || '-'}</td>
                      <td>
                        <span
                          className={`status-badge status-${schedule.status
                            .toLowerCase()
                            .replace(' ', '-')}`}>
                          {schedule.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-projects-message">No schedules found.</p>
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

export default SchedulesPage;
