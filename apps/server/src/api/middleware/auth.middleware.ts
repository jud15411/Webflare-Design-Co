import { type Request, type Response, type NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { User, type IUser } from '../v1/settings/users/users.model.js';
import { type IRole } from '../v1/roles/role.model.js';

// Extend the Request interface to include the user property
export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Middleware to protect routes. It verifies the JWT and attaches the
 * full user document from the database to the request object.
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  // 1. Check if the header exists and is properly formatted
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check if the token was successfully extracted
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized, token missing or malformed' });
  }

  try {
    // 3. Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 4. Find the user by the ID from the decoded token
    // The select('-password') ensures we don't return the password hash
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // 5. Attach the user to the request object for use in subsequent middleware
    req.user = user;

    // 6. Proceed to the next middleware
    next();
  } catch (error) {
    // Handles token-related errors (e.g., malformed, expired)
    res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

/**
 * Middleware to authorize users based on their role.
 * This should be used AFTER the `protect` middleware.
 */
export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // The protect middleware has already attached the user object.
    if (!req.user) {
      // This case should not be reached if `protect` is used first.
      return res
        .status(401)
        .json({ message: 'Not authorized, no user found.' });
    }

    try {
      // Now, we can check the user's role directly from the attached user object.
      // We need to populate the role field to access its name.
      const userWithRole = await User.findById(req.user._id).populate('role');
      if (!userWithRole || !roles.includes((userWithRole.role as IRole).name)) {
        return res.status(403).json({ message: 'User role not authorized.' });
      }
      // If the role is authorized, proceed
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      return res
        .status(500)
        .json({ message: 'Server error during authorization.' });
    }
  };
};
