import { useEffect, useMemo, useState } from 'react';
import './supportTickets.css';
import API from '../../utils/axios';
import { AxiosError } from 'axios';

// --- Type Definitions ---
type Ticket = {
  _id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: 'Cybersecurity'|'Web Development';
  client?: { clientName: string };
  project?: { name: string; category: string };
  assignedAgent?: { _id: string; name: string; role?: string };
  messages: Array<{ senderType: 'client'|'admin'; body: string; createdAt: string }>;
};

type User = { _id: string; name: string; role?: { _id: string; name: string } };
interface ApiError { message: string; }

// The constant is now used to filter active tickets
const ACTIVE_STATUSES = new Set(['New','Open','In Progress','On Hold','Awaiting Client Reply']);

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  // State for the custom success notification
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // State to control the filter
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const selected = useMemo(() => tickets.find(t => t._id === selectedId) || null, [tickets, selectedId]);
  
  // Memoized list of tickets to display based on the filter state
  const displayedTickets = useMemo(() => {
    if (!showActiveOnly) {
      return tickets;
    }
    // 🚨 FIX: Use ACTIVE_STATUSES to filter tickets
    return tickets.filter(t => ACTIVE_STATUSES.has(t.status));
  }, [tickets, showActiveOnly]);
  
  // Effect to automatically hide the success message after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchTickets = async () => {
    setLoading(true); setError(null);
    try {
      const response = await API.get('/tickets');
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      const errorMsg = (err as AxiosError<ApiError>).response?.data?.message || 'Failed to fetch tickets.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      const agents = response.data.filter((u: any) => u.role?.name !== 'Client');
      setUsers(agents);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const postReply = async () => {
    if (!selected || !reply.trim()) return;

    try {
      setReply(''); // Clear the input immediately
      await API.post(`/tickets/${selected._id}/message`, { body: reply.trim() });
      
      await fetchTickets();

    } catch (err) {
      const errorMsg = (err as AxiosError<ApiError>).response?.data?.message || 'Failed to post reply.';
      setError(errorMsg);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  // Sync state when a new ticket is selected
  useEffect(() => {
    if (selected) {
      setStatusUpdate(selected.status);
      setAssignee(selected.assignedAgent?._id || '');
    }
  }, [selected]);


  // UPDATED: The function to save metadata (status/agent assignment)
  const saveMeta = async () => {
    if (!selected) return;

    let successMsg = '';
    
    // Determine the original values before any change
    const originalStatus = selected.status;
    const originalAssigneeId = selected.assignedAgent?._id || '';
    
    // Check if changes were actually made
    const isStatusChanged = statusUpdate && statusUpdate !== originalStatus;
    const isAssigneeChanged = assignee !== originalAssigneeId;

    if (!isStatusChanged && !isAssigneeChanged) {
        return;
    }

    try {
      // 1. Handle Status Change
      if (isStatusChanged) {
        await API.patch(`/tickets/${selected._id}/status`, { status: statusUpdate });
        successMsg += `Status updated to **${statusUpdate}**. `;
      }

      // 2. Handle Agent Assignment
      if (isAssigneeChanged) {
        const newAgentName = users.find(u => u._id === assignee)?.name || 'Unassigned';
        
        await API.patch(`/tickets/${selected._id}/agent`, { agentId: assignee });
        
        if (assignee) {
            successMsg += `Ticket successfully assigned to **${newAgentName}**.`;
        } else {
            successMsg += `Ticket successfully **unassigned**.`;
        }
      }
      
      await fetchTickets();

      // 🚨 Custom success message pop-up
      setSuccessMessage(successMsg.trim());

    } catch (err) {
       const errorMsg = (err as AxiosError<ApiError>).response?.data?.message || 'Failed to save metadata.';
       setError(errorMsg);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusClass = (status: string) => status.toLowerCase().replace(/ /g, '-');
  const getPriorityClass = (priority: string) => priority.toLowerCase();
  

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Support Tickets</h1>
        <p>Manage all client support requests.</p>
      </div>

      {/* 🚨 Custom Success Notification */}
      {successMessage && (
        <div 
          style={{ 
            padding: '12px', 
            marginBottom: '16px', 
            borderRadius: '8px', 
            backgroundColor: 'var(--background-secondary)', 
            color: 'var(--text-primary)', 
            border: '1px solid var(--success-color)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
          }}
          onClick={() => setSuccessMessage(null)} // Click to dismiss
          dangerouslySetInnerHTML={{
            __html: `<span style="color: var(--success-color)">✅</span> ${successMessage}`
          }}
        />
      )}

      {error && <div className="error-message">{error}</div>}
      
      <div className="grid two">
        <section className="tickets-list">
          {/* 🚨 Filter Control */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
             <input 
               type="checkbox" 
               id="active-filter" 
               checked={showActiveOnly} 
               onChange={(e) => setShowActiveOnly(e.target.checked)} 
             />
             <label htmlFor="active-filter" style={{ display: 'flex', flexDirection: 'row', gap: '4px', margin: 0 }}>
               <span>Show Active Tickets Only ({displayedTickets.length}/{tickets.length})</span>
             </label>
          </div>
          
          {loading ? (
            <p>Loading tickets...</p>
          ) : displayedTickets.length === 0 ? ( 
            <p>{showActiveOnly ? 'No active tickets found.' : 'No tickets found.'}</p>
          ) : (
            // Use the filtered list here
            displayedTickets.map((ticket) => (
              <div
                key={ticket._id}
                className={`ticket-item ${ticket._id === selectedId ? 'selected' : ''}`}
                onClick={() => setSelectedId(ticket._id)}
              >
                <div className="ticket-header">
                  <h3>{ticket.subject}</h3>
                  <div className={`chip status-${getStatusClass(ticket.status)}`}>{ticket.status}</div>
                </div>
                <div className="ticket-meta">
                  <span className={`badge priority-${getPriorityClass(ticket.priority)}`}>{ticket.priority}</span>
                  <span className="chip">{ticket.client?.clientName || 'N/A'}</span>
                  <span className="chip">{ticket.category}</span>
                </div>
                {ticket.assignedAgent && (
                  <div className="ticket-agent">
                    Assigned: {ticket.assignedAgent.name}
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        <section className="ticket-detail">
          {!selected ? (
            <p>Select a ticket to view details.</p>
          ) : (
            <>
              <div className="card detail-header">
                <h2>{selected.subject}</h2>
                <p>Client: {selected.client?.clientName || 'N/A'}</p>
                <p>Project: {selected.project?.name || 'N/A'}</p>
              </div>

              <div className="card detail-meta card grid two">
                <label>
                  <span>Status</span>
                  <select value={statusUpdate} onChange={(e)=> setStatusUpdate(e.target.value)}>
                    <option>New</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                    <option>Awaiting Client Reply</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </label>
                <label>
                  <span>Assigned Agent</span>
                  <select value={assignee} onChange={(e)=> setAssignee(e.target.value)}>
                    <option value="">—</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name}{u.role ? ` (${u.role.name})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="detail-controls">
                <div className="actions">
                  <button type="button" className="btn-primary" onClick={saveMeta}>Save</button>
                </div>
              </div>

              {/* Messages History */}
              <div className="card detail-messages">
                <h2>Message History</h2>
                <div className="messages">
                  {selected.messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`bubble ${message.senderType === 'admin' ? 'admin' : 'client'}`}
                    >
                      <div className="bubble-header">
                        <span className="sender-type">{message.senderType}</span>
                        <span className="timestamp">{formatDate(message.createdAt)}</span>
                      </div>
                      <p>{message.body}</p>
                    </div>
                  )).reverse()} 
                </div>
              </div>


              <div className="card" style={{ marginTop:12 }}>
                <h2>Reply</h2>
                <textarea rows={4} value={reply} onChange={(e)=> setReply(e.target.value)} placeholder="Write a reply to the client..." />
                <div className="actions">
                  <button type="button" className="btn-primary" onClick={postReply}>Send Reply</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}