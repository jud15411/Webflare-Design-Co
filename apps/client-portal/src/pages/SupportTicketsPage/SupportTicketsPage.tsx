import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { ITicket } from '../../types/ticket'; 
import API from '../../utils/axios'; 
import './SupportTicketsPage.css'; 
import { FaPaperPlane, FaPlus, FaSpinner, FaExclamationCircle, FaCommentDots, FaSync } from 'react-icons/fa';
// 🚨 This component now expects onSelect: (id: string) => void
import { TicketItem } from '../../components/TicketItem'; 
import { isAxiosError } from 'axios'; 

// Statuses that represent active, ongoing work.
const ACTIVE_STATUSES = new Set(['New', 'Open', 'In Progress', 'On Hold', 'Awaiting Client Reply']);

export const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Memoized lists for rendering
  const activeTickets = useMemo(() => tickets.filter(t => ACTIVE_STATUSES.has(t.status)), [tickets]);
  const pastTickets = useMemo(() => tickets.filter(t => !ACTIVE_STATUSES.has(t.status)), [tickets]);

  const selectedTicket = useMemo(() => {
    return selectedTicketId ? tickets.find(ticket => ticket._id === selectedTicketId) : null;
  }, [tickets, selectedTicketId]);
  
  // --- CORE FIX: Safe Data Fetching (Prevents length crash) ---
  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await API.get<ITicket[]>('/tickets/my-tickets');
      
      // 🚨 CRITICAL FIX: Ensure the state is always set to an array.
      const fetchedTickets = Array.isArray(res.data) ? res.data : [];
      setTickets(fetchedTickets); 
      
      // Automatically select the first ticket if the list isn't empty
      if (fetchedTickets.length > 0 && !selectedTicketId) {
        setSelectedTicketId(fetchedTickets[0]._id);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch tickets.');
      } else {
        setError('An unknown error occurred.');
      }
      // CRITICAL FALLBACK: Always set state to an empty array on failure
      setTickets([]); 
    } finally {
      if (!isRefresh) setLoading(false);
      else setIsRefreshing(false);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Handler for posting a reply
  const handleReplySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicketId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await API.post(`/tickets/${selectedTicketId}/message`, { body: reply });

      // Update the ticket in the local state with the newly returned data 
      setTickets(prevTickets => prevTickets.map(t => 
        t._id === selectedTicketId ? res.data : t
      ));
      
      setReply('');
    } catch (err) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to send reply.');
      } else {
        alert('An unknown error occurred while sending the reply.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [reply, selectedTicketId, isSubmitting]);

  // Handler for selecting a ticket - TYPE: (id: string) => void
  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
  };
  
  // --- JSX Rendering ---
  const displayedTickets = activeTab === 'active' ? activeTickets : pastTickets;

  return (
    <div className="support-tickets-container">
      {/* Sidebar - Ticket List */}
      <div className="tickets-sidebar">
        <div className="tickets-header">
          <h2>Support Tickets</h2>
          <div className="ticket-actions">
            <button 
              className="btn-icon" 
              onClick={() => fetchTickets(true)}
              disabled={isRefreshing}
              title="Refresh Tickets"
            >
              <FaSync className={isRefreshing ? 'spin' : ''} />
            </button>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/client-portal/support/new')}
            >
              <FaPlus className="btn-icon" /> New
            </button>
          </div>
        </div>
        
        {/* Tabs for Active/Past */}
        <div className="tickets-tabs">
          <div 
            className={`tab ${activeTab === 'active' ? 'active' : ''}`} 
            onClick={() => setActiveTab('active')}
          >
            Active ({activeTickets.length})
          </div>
          <div 
            className={`tab ${activeTab === 'past' ? 'active' : ''}`} 
            onClick={() => setActiveTab('past')}
          >
            Past ({pastTickets.length})
          </div>
        </div>

        {/* List Content */}
        <div className="tickets-list">
          {loading ? (
            <div className="loading-state">
              <FaSpinner className="spin" /> Loading Tickets...
            </div>
          ) : error ? (
            <div className="error-state">
              <FaExclamationCircle /> {error}
            </div>
          ) : displayedTickets.length === 0 ? (
            <div className="empty-state">
              <FaCommentDots /> No {activeTab} tickets found.
            </div>
          ) : (
            displayedTickets.map(ticket => (
              <TicketItem 
                key={ticket._id} 
                ticket={ticket} 
                isSelected={ticket._id === selectedTicketId}
                // Passes (id: string) => void, which is now correctly defined in TicketItemProps
                onSelect={handleSelectTicket} 
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content - Ticket Detail */}
      <div className="ticket-detail">
        {selectedTicket ? (
          <>
            <div className="ticket-detail-header">
              <h1>{selectedTicket.subject}</h1>
              <div className="meta-row">
                <span className="chip status-badge">{selectedTicket.status}</span>
                <span className="chip priority-badge">{selectedTicket.priority}</span>
                <span className="text-secondary">
                  Project: {selectedTicket.project?.name || 'N/A'}
                </span>
                <span className="text-secondary">
                  Category: {selectedTicket.category}
                </span>
              </div>
            </div>

            <div className="ticket-detail-messages">
              {/* Initial Ticket Description as the first 'message' */}
              <div className="bubble agent">
                <p className="bubble-body">{selectedTicket.description}</p>
                <div className="bubble-meta">
                  <span className="bubble-sender">Client</span>
                  <span className="bubble-date">
                    {format(new Date(selectedTicket.createdAt as string), 'MMM d, yyyy @ h:mm a')}
                  </span>
                </div>
              </div>

              {/* Threaded Messages */}
              {selectedTicket.messages?.map((message, index) => (
                <div 
                  key={index} 
                  className={`bubble ${message.senderType === 'client' ? 'client' : 'agent'}`}
                >
                  <p className="bubble-body">{message.body}</p>
                  <div className="bubble-meta">
                    <span className="bubble-sender">
                      {message.senderType === 'client' ? 'You' : 'Agent'}
                    </span>
                    <span className="bubble-date">
                      {format(new Date(message.createdAt as string), 'MMM d, yyyy @ h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form (only if ticket is not resolved/closed) */}
            {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
              <form onSubmit={handleReplySubmit} className="reply-form">
                <div className="form-group">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!reply.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <><FaSpinner className="spin" /> Sending...</>
                    ) : (
                      <><FaPaperPlane className="btn-icon" /> Send Reply</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          // Empty State for No Ticket Selected
          <div className="no-ticket-selected">
            <div className="empty-state">
              <div className="empty-state-icon"><FaCommentDots /></div>
              <h3>{tickets.length === 0 && !loading ? 'No tickets found' : 'No ticket selected'}</h3>
              <p>Select a ticket from the list or create a new one to get started.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/client-portal/support/new')}
              >
                <FaPlus className="btn-icon" /> New Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;