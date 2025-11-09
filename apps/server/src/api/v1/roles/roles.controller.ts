import { type Request, type Response } from 'express';
import { Role } from './role.model.js';
import { User } from '../settings/users/users.model.js';

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  const roles = await Role.find({});
  res.status(200).json(roles);
};

// Create a role
export const createRole = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const newRole = await Role.create({ name, description });
  res.status(201).json(newRole);
};

// Update a role
export const updateRole = async (req: Request, res: Response) => {
  const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(updatedRole);
};

// Delete a role
export const deleteRole = async (req: Request, res: Response) => {
  const roleId = req.params.id;
  // Prevent deletion if any user is assigned this role
  const userCount = await User.countDocuments({ role: roleId });
  if (userCount > 0) {
    return res
      .status(400)
      .json({
        message: 'Cannot delete role as it is currently assigned to users.',
      });
  }
  await Role.findByIdAndDelete(roleId);
  res.status(200).json({ message: 'Role deleted successfully.' });
};
