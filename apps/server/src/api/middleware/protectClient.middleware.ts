import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { ClientUser, type IClientUser } from '../v1/client/clientUser.model.js';

// Extend the Request interface to include the clientUser property
export interface AuthClientRequest extends Request {
  clientUser?: IClientUser;
}

/**
 * Middleware to protect client portal routes. It verifies the client's JWT
 * and attaches the full clientUser document to the request object.
 */
export const protectClient = async (
  req: AuthClientRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const clientUser = await ClientUser.findById(decoded.id).populate('client');

    if (!clientUser || !clientUser.portalAccessGranted) {
      return res.status(401).json({ message: 'Authorization failed.' });
    }

    req.clientUser = clientUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};
