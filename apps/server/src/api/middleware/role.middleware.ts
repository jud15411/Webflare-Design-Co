import { type Response, type NextFunction } from 'express';
import { type AuthRequest } from './auth.middleware.js';
import { UserRole } from '../v1/settings/users/users.model.js';
import { Role } from '../v1/roles/role.model.js'; // 1. Import the Role model

export const authorizeRoles = (...roles: UserRole[]) => {
  // 2. Make the inner function async
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    // 3. Check if the user object or role ID exists
    if (!user || !user.role) {
      return res
        .status(403)
        .json({ message: 'Authorization failed: User data is missing.' });
    }

    try {
      // 4. Fetch the role document from the database using the ID
      const userRoleDoc = await Role.findById(user.role);

      // 5. Check if the role was found and if its name is in the allowed roles
      if (!userRoleDoc || !roles.includes(userRoleDoc.name as UserRole)) {
        return res
          .status(403)
          .json({ message: 'You are not authorized to access this resource.' });
      }

      // 6. If authorized, proceed
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Server error during authorization.' });
    }
  };
};
