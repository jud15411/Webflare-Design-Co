import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { User, type IUser } from '../api/v1/auth/user.model.js';
import { type IRole } from '../api/v1/roles/role.model.js';

// Extend the Request interface to include the user property
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Middleware to protect routes. It verifies the JWT and attaches the
 * full user document with the populated role to the request object.
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized, token missing or malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // FIND AND POPULATE USER'S ROLE IN A SINGLE CALL
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

/**
 * Middleware to authorize users based on their role.
 * This should be used AFTER the `protect` middleware.
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (
      !req.user ||
      !req.user.role ||
      !roles.includes((req.user.role as IRole).name)
    ) {
      return res.status(403).json({ message: 'User role not authorized.' });
    }

    next();
  };
};
