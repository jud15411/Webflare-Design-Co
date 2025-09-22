import { type Request, type Response } from 'express';
import { User } from './user.model.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// --- Validation Schemas ---
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- Controller Functions ---
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // FIX 1: Use the correct variable name 'userExists'
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // FIX 2: Now 'createdUser' can be declared without conflict
    const createdUser = await User.create({ name, email, password });
    res.status(201).json({
      message: 'User registered successfully',
      userId: createdUser._id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: (error as z.ZodError).issues,
      });
    }
    // It's better to log the actual error for debugging
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).populate('role');

    // FIX 3: Check for null user first, then check password.
    // This resolves the "'user' is possibly 'null'" error.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT with user role
    const token = jwt.sign(
      {
        id: user._id,
        // Include the full role object
        role: {
          _id: (user.role as any)._id,
          name: (user.role as any).name,
        },
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '1d',
      }
    );

    // Return both token and user data including the populated role
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // <- Include the full role object
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid data',
        errors: (error as z.ZodError).issues,
      });
    }
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
