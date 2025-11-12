// File: apps/server/src/modules/clientAuth/clientAuth.controller.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IClientUser, ClientUser } from '../client/clientUser.model.js';
import { Client } from '../client/client.model.js';

// Helper: generate JWT for client users
const generateClientToken = (id: string, email: string) => {
  return jwt.sign({ 
    id, 
    email, 
    role: { 
      _id: 'client', 
      name: 'Client',
      permissions: ['read:tickets', 'create:tickets', 'reply:tickets']
    } 
  }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};

// @desc    Check client login status by email
// @route   POST /api/client-auth/status
// @access  Public
export const checkClientStatus = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = (await ClientUser.findOne({ email }).select('+password')) as (IClientUser | null);
    if (!user) return res.status(404).json({ message: 'NOT_FOUND' });

    if (!user.portalAccessGranted) {
      return res.status(403).json({ message: 'ACCESS_DENIED' });
    }

    const clientDetails = await Client.findById(user.client).select('clientName');
    // First-time setup if password not set
    if (!user.password) {
      return res.status(200).json({
        status: 'FIRST_TIME',
        user: {
          _id: String(user._id),
          email: user.email,
          client: user.client,
          clientName: clientDetails?.clientName,
        },
      });
    }

    return res.status(200).json({
      status: 'PASSWORD_REQUIRED',
      user: {
        _id: String(user._id),
        email: user.email,
        client: user.client,
        clientName: clientDetails?.clientName,
      },
    });
  } catch (error) {
    console.error('Client status check failed:', error);
    res.status(500).json({ message: 'ERROR' });
  }
};

// @desc    First-time password setup for a client user
// @route   POST /api/client-auth/set-password
// @access  Public (guarded by server-side checks)
export const setClientPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = (await ClientUser.findOne({ email }).select('+password')) as (IClientUser | null);
    if (!user) return res.status(404).json({ message: 'NOT_FOUND' });

    if (!user.portalAccessGranted) {
      return res.status(403).json({ message: 'ACCESS_DENIED' });
    }

    // Only allow setting a password for first-time setup
    if (user.password) {
      return res.status(409).json({ message: 'ALREADY_SET' });
    }

    user.password = password;
    await user.save();

    const clientDetails = await Client.findById(user.client).select('clientName');

    return res.status(200).json({
      status: 'AUTHENTICATED',
      _id: String(user._id),
      email: user.email,
      client: user.client,
      clientName: clientDetails?.clientName,
      token: generateClientToken(String(user._id), user.email),
    });
  } catch (error) {
    console.error('Client set password failed:', error);
    res.status(500).json({ message: 'ERROR' });
  }
};

// @desc    Authenticate client user and get token
// @route   POST /api/client-auth/login
// @access  Public
export const clientLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Need password field for comparison
    const user = (await ClientUser.findOne({ email }).select('+password')) as (IClientUser | null);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.portalAccessGranted) {
      return res.status(403).json({ message: 'ACCESS_DENIED' });
    }

    // If password not set, instruct first-time setup
    if (!user.password) {
      return res.status(403).json({ message: 'FIRST_TIME' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const clientDetails = await Client.findById(user.client).select('clientName status');
    const token = generateClientToken(String(user._id), user.email);
    
    res.status(200).json({
      _id: String(user._id),
      email: user.email,
      client: user.client,
      clientName: clientDetails?.clientName,
      token,
      role: {
        _id: 'client',
        name: 'Client',
        permissions: ['read:tickets', 'create:tickets', 'reply:tickets']
      }
    });
  } catch (error) {
    console.error('Client login failed:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};