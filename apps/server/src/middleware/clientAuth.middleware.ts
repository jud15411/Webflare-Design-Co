import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { ClientUser } from '../api/v1/client/clientUser.model.js';
import { Client } from '../api/v1/client/client.model.js';

// Extend the Request interface to include the user property
export interface ClientAuthRequest extends Request {
  clientUser?: {
    _id: string;
    email: string;
    client: string;
    role: string;
    clientName?: string;
  };
}

/**
 * Middleware to protect client routes. It verifies the JWT and attaches the
 * client user to the request object.
 */
export const clientProtect = async (
  req: ClientAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing or malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Find the client user
    const user = await ClientUser.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // For client users, check portal access
    const userRole = (user as any).role || 'client';
    
    if (userRole === 'client') {
      if (!(user as any).portalAccessGranted) {
        return res.status(403).json({ message: 'Access denied. Please contact support.' });
      }

      // Get client details for client users
      const clientDetails = await Client.findById(user.client).select('clientName');
      req.clientUser = {
        _id: String(user._id),
        email: user.email,
        client: String(user.client),
        role: 'client',
        ...(clientDetails?.clientName && { clientName: clientDetails.clientName })
      };
    } else {
      // For admin/agent users, just attach basic info
      const clientId = (user as any).client ? String((user as any).client) : '';
      let clientName: string | undefined;
      
      // Only fetch client details if client ID exists
      if (clientId) {
        const clientDetails = await Client.findById(clientId).select('clientName').lean();
        clientName = clientDetails?.clientName;
      }
      
      req.clientUser = {
        _id: String(user._id),
        email: user.email,
        client: clientId,
        role: userRole,
        ...(clientName && { clientName })
      };
    }

    next();
  } catch (error) {
    console.error('Client auth error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
