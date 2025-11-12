import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientAuth } from '../contexts/ClientAuthContext';
import API from '../utils/axios';
import './DashboardPage.css';
import { SubmitTicketModal } from '../components/SubmitTicketModal';
import { FaTicketAlt, FaPlus, FaChartLine, FaBullhorn, FaTools } from 'react-icons/fa';

/**
 * Simple client portal dashboard displaying client-specific information.
 */
type ProjectLite = { _id: string; name: string; status: string; category: string };

export const DashboardPage: React.FC = () => {
  const { user, logout } = useClientAuth();
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [recentTickets, setRecentTickets] = useState<Array<{_id: string, subject: string, status: string, updatedAt: string}>>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTicketsLoading(true);
      
      try {
        // Fetch projects
        const projectsRes = await API.get<ProjectLite[]>('/client-portal/projects');
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data.slice(0, 3) : []);
        
        // Fetch recent tickets
        const ticketsRes = await API.get('/tickets/my-tickets?limit=3');
        setRecentTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setProjects([]);
        setRecentTickets([]);
      } finally {
        setLoading(false);
        setTicketsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const summary = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status && p.status.toLowerCase() !== 'completed').length;
    return { total, active };
  }, [projects]);

  return (
    <div className="portal-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.clientName || 'Client'}</h1>
        <div>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>Overview</h2>
        {/* Basic identity card remains for reference */}
        <div className="info-box identity-box" style={{ marginTop: 20 }}>
          <p>Hello, {user?.clientName}! This is your secure dashboard.</p>
          <p>
            User ID: <code>{user?._id}</code>
          </p>
        </div>
        {/* Card grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {/* Projects Summary Card */}
          <div className="info-box">
            <h3 style={{ marginTop: 0, color: '#fff' }}>Projects Summary</h3>
            {loading ? (
              <p>Loading projects...</p>
            ) : (
              <>
                <p style={{ marginBottom: 8 }}>Total Projects: <strong>{summary.total}</strong></p>
                <p style={{ marginBottom: 16 }}>Active: <strong>{summary.active}</strong></p>
                {projects.length > 0 ? (
                  <ul style={{ marginTop: 8, marginBottom: 16 }}>
                    {projects.map((p) => (
                      <li key={p._id} style={{ marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>{p.name}</span> · <span style={{ opacity: 0.8 }}>{p.status}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No recent projects found.</p>
                )}
                <Link to="/projects" className="logout-button">See all projects</Link>
              </>
            )}
          </div>

          {/* Activity Summary Card */}
          <div className="info-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaChartLine />
              <h3 style={{ margin: 0, color: '#fff' }}>Activity Summary</h3>
            </div>
            <p style={{ opacity: 0.85, marginBottom: '16px' }}>Your recent activity and updates will appear here.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Active Projects</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{summary.active}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Open Tickets</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {recentTickets.filter(t => ['New', 'Open', 'In Progress'].includes(t.status)).length}
                </div>
              </div>
            </div>
          </div>

          {/* Support Tickets Card */}
          <div className="info-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTicketAlt /> Support Tickets
              </h3>
              <button 
                onClick={() => setTicketOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #fff',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem'
                }}
              >
                <FaPlus size={12} /> New Ticket
              </button>
            </div>
            
            {ticketsLoading ? (
              <p>Loading tickets...</p>
            ) : recentTickets.length > 0 ? (
              <div style={{ marginTop: '12px' }}>
                {recentTickets.map(ticket => (
                  <div key={ticket._id} style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 500,
                        marginBottom: '4px'
                      }}>
                        {ticket.subject}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          backgroundColor: ticket.status === 'Open' ? 'rgba(66, 153, 225, 0.2)' : 
                                         ticket.status === 'In Progress' ? 'rgba(237, 137, 54, 0.2)' :
                                         'rgba(160, 174, 192, 0.2)',
                          color: ticket.status === 'Open' ? '#63b3ed' : 
                                 ticket.status === 'In Progress' ? '#ed8936' :
                                 '#a0aec0'
                        }}>
                          {ticket.status}
                        </span>
                        <span>
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                  <button 
                    onClick={() => setTicketOpen(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      ':hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    } as React.CSSProperties}
                  >
                    <FaPlus size={12} /> New Ticket
                  </button>
                  <Link 
                    to="/support/tickets" 
                    style={{
                      color: '#fff',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      ':hover': {
                        background: 'rgba(255,255,255,0.15)'
                      }
                    } as React.CSSProperties}
                  >
                    View All Tickets
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ marginBottom: '16px' }}>No recent support tickets</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setTicketOpen(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      ':hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    } as React.CSSProperties}
                  >
                    <FaPlus size={12} /> New Ticket
                  </button>
                  <Link 
                    to="/support/tickets"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      ':hover': {
                        background: 'rgba(255,255,255,0.15)'
                      }
                    } as React.CSSProperties}
                  >
                    View All Tickets
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div className="info-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaBullhorn />
              <h3 style={{ margin: 0, color: '#fff' }}>Announcements</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontWeight: 500 }}>New Portal Features</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Check out the latest updates to your portal.</div>
              </li>
              <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontWeight: 500 }}>Scheduled Maintenance</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Friday, 8–9 PM EST</div>
              </li>
              <li style={{ padding: '8px 0' }}>
                <div style={{ fontWeight: 500 }}>Q4 Strategy Call</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Invites have been sent for our quarterly review.</div>
              </li>
            </ul>
          </div>

          {/* Quick Actions Card */}
          <div className="info-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaTools />
              <h3 style={{ margin: 0, color: '#fff' }}>Quick Actions</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Link 
                to="/projects" 
                className="dashboard-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                View Projects
              </Link>
              <Link 
                to="/support/tickets"
                className="dashboard-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.1)',
                  ':hover': {
                    background: 'rgba(255,255,255,0.15)'
                  }
                } as React.CSSProperties}
              >
                View All Tickets
              </Link>
              <a 
                href="mailto:support@yourcompany.com" 
                className="dashboard-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Contact Support
              </a>
              <Link 
                to="/invoices" 
                className="dashboard-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                View Invoices
              </Link>
            </div>
          </div>
        </div>
      </main>
      {/* Submit Ticket Modal */}
      <SubmitTicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} />
    </div>
  );
};