import { type Request, type Response } from 'express';
import { z } from 'zod';
import { User } from '../auth/user.model.js';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { type IRole } from '../roles/role.model.js';
import { Types } from 'mongoose';

// --- Validation Schemas ---

const userProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty.'),
  email: z.string().email('Invalid email address.'),
  bio: z.string().optional(),
  location: z.string().optional(),
});

const addUserSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  role: z.string().nonempty('Role is required.'),
});

const updateUserRoleSchema = z.object({
  role: z.string().nonempty('Role ID is required.'),
});

// --- Controller Functions ---

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password').populate('role').lean();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = addUserSchema.parse(req.body);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' });
    }

    // 👇 2. Convert the string to an ObjectId before creating the user
    const newUser = new User({
      name,
      email,
      password,
      role: new Types.ObjectId(role),
    });
    await newUser.save();
    await newUser.populate('role');

    res.status(201).json(newUser.toJSON());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data provided.', errors: error.issues });
    }
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error while adding user.' });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if ((user.role as IRole)?.name === 'CEO') {
      return res
        .status(403)
        .json({ message: 'The CEO account cannot be removed.' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User removed successfully.' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Server error while removing user.' });
  }
};

// @desc    Update user profile information
// @route   PATCH /api/v1/users/profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;

    const updatedUser = await user.save();

    // Send back a clean user object without sensitive data
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      location: updatedUser.location,
      role: req.user!.role, // Preserve role from the authenticated user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// @desc    Update user password
// @route   PATCH /api/v1/users/update-password
export const updateUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Please provide both current and new passwords.' });
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    // Set and save the new password (hashing is handled by the model's pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating password.' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = updateUserRoleSchema.parse(req.body);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 👇 3. Convert the string to an ObjectId before assigning it
    user.role = new Types.ObjectId(role);
    await user.save();
    await user.populate('role');

    res
      .status(200)
      .json({ message: 'User role updated successfully', user: user.toJSON() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data', errors: error.issues });
    }
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error while updating role.' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if ((user.role as IRole)?.name === 'CEO') {
      return res
        .status(403)
        .json({ message: 'The CEO account cannot be deactivated.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Server error while toggling status.' });
  }
};
