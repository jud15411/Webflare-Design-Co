import { Router, type Response } from 'express';
// 🚨 IMPORTANT: Import Types from mongoose to correctly handle ObjectId casting
import { Types } from 'mongoose'; 
import jwt, { type JwtPayload } from 'jsonwebtoken'; 

// --- Middleware & Auth Imports ---
// 🚨 Adjust these paths based on your actual file structure
import { protect, authorize, AuthRequest } from '../../middleware/auth.middleware.js'; 
import { clientProtect, ClientAuthRequest } from '../../../middleware/clientAuth.middleware.js';

// --- Model Imports ---
// 🚨 CRITICAL: Check these paths are correct
import { Ticket, TicketStatus } from './ticket.model.js';
import { User } from '../settings/users/users.model.js'; // Admin/Agent User Model
import { ClientUser, IClientUser } from '../client/clientUser.model.js'; // Client Portal User Model

import { subscribe, publish } from '../../../utils/sse.js';

const router = Router();

// Client-specific actions router
const clientRouter = Router();
clientRouter.use(clientProtect);

// Admin/Agent-specific actions router
const adminRouter = Router();
adminRouter.use(protect, authorize('CEO', 'CTO', 'Agent', 'Staff'));

// Add the /my-tickets endpoint for clients
clientRouter.get('/my-tickets', async (req: ClientAuthRequest, res: Response) => {
    try {
        if (!req.clientUser) {
            return res.status(401).json({ message: 'Not authorized as a client.' });
        }

        const tickets = await Ticket.find({ client: req.clientUser.client })
            .select('-messages')
            .populate('project', 'name category')
            .populate('client', 'clientName')
            .sort({ createdAt: -1 })
            .lean();
            
        return res.status(200).json(tickets);
    } catch (err) {
        console.error('Error fetching client tickets:', err);
        return res.status(500).json({ message: 'Error fetching tickets.' });
    }
});

// --------------------------------------------------------------------------------
// --- Shared/Unprotected Routes ---
// --------------------------------------------------------------------------------

// GET /api/v1/tickets/stream - SSE for ticket updates
router.get('/stream', (req, res) => {
  if (req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  subscribe('tickets', req as any, res as any); 
});

// --------------------------------------------------------------------------------
// 🚨 UNIFIED TICKET LIST ROUTE: GET /api/v1/tickets
// Manually checks for Admin (User) token, then Client (ClientUser) token.
// --------------------------------------------------------------------------------
router.get('/', async (req, res: Response) => {
    
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token as string;
    }
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token missing.' });
    }

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized, token verification failed.' });
    }
    
    const userId = decoded.id;

    if (!Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ message: 'Not authorized, token payload ID is invalid.' });
    }
    
    const userIdObjectId = new Types.ObjectId(userId);

    // --- 1. TRY ADMIN/AGENT AUTHENTICATION (User Model) ---
    try {
        const adminUser = await User.findById(userIdObjectId).select('-password').populate('role').lean(); 
        
        if (adminUser && (adminUser.role as any)?.name) {
            const roleName = (adminUser.role as any).name;
            const isAdminOrAgent = ['CEO', 'CTO', 'Agent', 'Staff'].some(r => roleName.toLowerCase().includes(r.toLowerCase()));
            
            if (isAdminOrAgent) {
                // Admin/Agent found, return ALL tickets
                const tickets = await Ticket.find({})
                    .populate('client', 'clientName')
                    .populate('project', 'name category')
                    .populate({
                        path: 'assignedAgent',
                        select: 'name email role',
                        options: { lean: true }
                    })
                    .sort({ createdAt: -1 })
                    .lean();

                return res.status(200).json(tickets);
            }
        }
    } catch (err) {
        console.error('Error during Admin/Agent lookup:', err);
        // Do NOT return here, proceed to client check
    }
    
    // --- 2. TRY CLIENT AUTHENTICATION (ClientUser Model) ---
    try {
        const clientUser = await ClientUser.findById(userIdObjectId).select('-password').lean() as IClientUser | null; 
        
        if (clientUser) {
            if (clientUser.portalAccessGranted) {
                 // Client found, return ONLY their tickets, using the client's company ID
                const tickets = await Ticket.find({ client: clientUser.client })
                    .select('-messages') 
                    .populate('project', 'name category')
                    .lean();
                    
                return res.status(200).json(tickets);
            } else {
                // Client found, but access denied
                return res.status(403).json({ message: 'Access denied. Please contact support.' });
            }
        }
    } catch (err) {
        console.error('Error during ClientUser lookup:', err);
    }
    
    // --- 3. FINAL FALLBACK ---
    // Returned if the token is valid, but the ID doesn't exist in either collection
    return res.status(401).json({ message: 'Not authorized. User token did not match any active Admin or Client account.' });
});

// --------------------------------------------------------------------------------
// --- Admin-Specific Actions (Mounted via adminRouter) ---
// --------------------------------------------------------------------------------

// PATCH /api/v1/tickets/:id/status - Update ticket status
adminRouter.patch('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(TicketStatus).includes(status)) { 
      return res.status(400).json({ message: 'Invalid ticket status provided.' });
    }

    const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Add publishing logic here...
    
    res.status(200).json({ message: 'Status updated successfully', status: ticket.status });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Error updating ticket status.' });
  }
});


// PATCH /api/v1/tickets/:id/agent - Assign a ticket to an agent
adminRouter.patch('/:id/agent', async (req: AuthRequest, res) => { 
  try {
    const { id } = req.params;
    const { agentId } = req.body; 
    let assignedAgentId: Types.ObjectId | null = null;
    
    if (agentId && agentId.trim() !== "" && Types.ObjectId.isValid(agentId)) {
      const user = await User.findById(agentId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' }); 
      }
      assignedAgentId = new Types.ObjectId(agentId);
    } else if (agentId) { // Check for non-empty string that is not a valid ObjectId
        return res.status(400).json({ message: 'Invalid agentId format.' });
    }


    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { assignedAgent: assignedAgentId }, 
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Add publishing logic here...

    res.status(200).json(ticket);

  } catch (err: any) {
    console.error('Error assigning agent:', err);
    res.status(500).json({ message: 'Error updating assigned agent.' });
  }
});


// POST /api/v1/tickets/:id/message - Agent replies to a ticket
adminRouter.post('/:id/message', async (req: AuthRequest, res) => {
  const senderType: 'client' | 'admin' = 'admin';
  
  try {
    const { body } = req.body;
    
    if (!body) {
      return res.status(400).json({ message: 'Message body is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // 🚨 Ensure senderId is safely cast
    ticket.messages.push({ 
      senderType, 
      body,
      senderId: req.user?._id ? new Types.ObjectId(String(req.user._id)) : undefined, 
      createdAt: new Date()
    });
    
    if (ticket.status === TicketStatus.NEW) {
      ticket.status = TicketStatus.OPEN;
    }
    
    await ticket.save();

    // Add publishing logic here...
    
    res.status(200).json(ticket);
  } catch (err: any) { 
    console.error('Error posting message:', err);
    res.status(500).json({ message: 'Error posting message.' });
  }
});

// --------------------------------------------------------------------------------
// --- Client-Specific Actions (Mounted via clientRouter) ---
// --------------------------------------------------------------------------------

// POST /api/v1/tickets - Client creates a new ticket
clientRouter.post('/', async (req: ClientAuthRequest, res) => {
    try {
        const { subject, description, priority, category, cybersecurity, webdev, project } = req.body;
        
        if (!subject || !description || !category || !req.clientUser?.client) {
            return res.status(400).json({ message: 'Missing required ticket fields.' });
        }

        const newTicket = new Ticket({
            client: new Types.ObjectId(req.clientUser.client), // Use client company ID
            project: project ? new Types.ObjectId(project) : undefined, 
            subject,
            description,
            priority,
            category,
            ...(category === 'Cybersecurity' && { cybersecurity }),
            ...(category === 'Web Development' && { webdev }),
            messages: [{
                senderType: 'client',
                // 🚨 Use the corrected casting: req.clientUser._id is a string
                senderId: req.clientUser?._id ? new Types.ObjectId(req.clientUser._id) : undefined, 
                body: description,
            }]
        });

        await newTicket.save();

        // Add publishing logic here...

        res.status(201).json(newTicket);

    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Failed to create ticket.' });
    }
});

// GET /api/v1/tickets/:id - Client gets a specific ticket with messages
clientRouter.get('/:id', async (req: ClientAuthRequest, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('project', 'name category')
            .lean();

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        // Must verify the ticket belongs to the client's company
        if (ticket.client.toString() !== req.clientUser?.client) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Failed to fetch ticket.' });
    }
});

// POST /api/v1/tickets/:id/message - Client sends a message on their ticket
clientRouter.post('/:id/message', async (req: ClientAuthRequest, res) => {
    try {
        const { body } = req.body;
        
        if (!body) {
            return res.status(400).json({ message: 'Message body is required.' });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket || ticket.client.toString() !== req.clientUser?.client) {
            return res.status(404).json({ message: 'Ticket not found or access denied.' });
        }

        ticket.messages.push({ 
            senderType: 'client', 
            body,
            // 🚨 Use the corrected casting
            senderId: req.clientUser?._id ? new Types.ObjectId(req.clientUser._id) : undefined, 
            createdAt: new Date()
        });
        
        if (ticket.status === TicketStatus.AWAITING_CLIENT) {
            ticket.status = TicketStatus.OPEN;
        }

        await ticket.save();

        // Add publishing logic here...
        
        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: 'Failed to post message.' });
    }
});

// Mount the routers
// Client router needs to be mounted first to handle /my-tickets before the unified / route
router.use('/', clientRouter);
router.use('/', adminRouter);

export default router;