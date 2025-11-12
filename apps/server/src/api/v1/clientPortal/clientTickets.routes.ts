import { Router } from 'express';
import { protectClient, type AuthClientRequest } from '../../middleware/protectClient.middleware.js';
import { Ticket, TicketPriority, TicketStatus } from '../tickets/ticket.model.js';
import { Project } from '../projects/project.model.js';
import { publish } from '../../../utils/sse.js';

const router = Router();
router.use(protectClient);

// GET /api/v1/client-portal/tickets - list client's tickets
router.get('/tickets', async (req: AuthClientRequest, res) => {
  try {
    const clientField: any = req.clientUser!.client;
    const clientId = String(clientField?._id ?? clientField);
    const tickets = await Ticket.find({ client: clientId })
      .populate('project', 'name category')
      .sort({ updatedAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// POST /api/v1/client-portal/tickets - create ticket (from client)
router.post('/tickets', async (req: AuthClientRequest, res) => {
  try {
    const clientField: any = req.clientUser!.client;
    const clientId = String(clientField?._id ?? clientField);
    const { project, subject, description, priority, category, cybersecurity, webdev } = req.body;

    // ensure project belongs to this client
    const proj = await Project.findById(project).lean();
    if (!proj || String((proj as any).client) !== clientId) {
      return res.status(403).json({ message: 'Invalid project' });
    }

    const ticket = await Ticket.create({
      client: clientId,
      project,
      subject,
      description,
      priority: priority || TicketPriority.MEDIUM,
      status: TicketStatus.NEW,
      category,
      cybersecurity,
      webdev,
      messages: [{ senderType: 'client', body: description }],
    });

    publish('tickets', 'ticket.created', { _id: ticket._id, type: 'created' });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// POST /api/v1/client-portal/tickets/:id/messages - add message to own ticket
router.post('/tickets/:id/messages', async (req: AuthClientRequest, res) => {
  try {
    const clientField: any = req.clientUser!.client;
    const clientId = String(clientField?._id ?? clientField);
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (String(ticket.client) !== clientId) return res.status(403).json({ message: 'Forbidden' });

    const { body } = req.body;
    ticket.messages.push({ senderType: 'client', body });
    ticket.status = TicketStatus.OPEN;
    await ticket.save();
    publish('tickets', 'ticket.message', { _id: ticket._id, type: 'message' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post message' });
  }
});

export default router;
