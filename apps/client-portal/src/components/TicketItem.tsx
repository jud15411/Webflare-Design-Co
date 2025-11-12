// src/components/TicketItem/TicketItem.tsx
import React from 'react';
import { format } from 'date-fns';
import type { ITicket } from '../types/ticket'; 

// 🚨 FIX APPLIED: The onSelect type is now a simple function (id: string) => void
export interface TicketItemProps {
  ticket: ITicket;
  isSelected: boolean;
  onSelect: (id: string) => void; 
}

export const TicketItem: React.FC<TicketItemProps> = ({ ticket, isSelected, onSelect }) => {
  const getStatusBadgeClass = (status: string) => {
    return status.toLowerCase().replace(/\s+/g, '-').replace('/', '-');
  };

  const formatDate = (dateString: string) => {
    try {
      // Explicitly create a Date object
      return format(new Date(dateString), 'MMM d, yyyy'); 
    } catch (e) {
      return 'N/A';
    }
  };

  const getLastActivity = () => {
    // Check if updatedAt is available (which it should be from the model)
    let lastActivityDateString = ticket.updatedAt as string;

    if (ticket.messages && ticket.messages.length > 0) {
        // Sort messages to find the most recent one
        const lastMessage = [...ticket.messages].sort(
            (a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
        )[0];
        lastActivityDateString = lastMessage.createdAt as string;
    }
    
    return formatDate(lastActivityDateString);
  };

  return (
    <div 
      className={`ticket-item ${isSelected ? 'active' : ''}`}
      // Call onSelect with the ticket's ID
      onClick={() => onSelect(ticket._id)}
    >
      <div className="ticket-item-header">
        <h4 className="ticket-subject">{ticket.subject}</h4>
        <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <div className="ticket-item-meta">
        <span className="ticket-id">#{ticket._id.slice(-6).toUpperCase()}</span>
        <span className="ticket-date">Last update: {getLastActivity()}</span>
      </div>
    </div>
  );
};