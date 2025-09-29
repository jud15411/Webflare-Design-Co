import { type Request, type Response } from 'express';
import { ClientUser } from '../client/clientUser.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  try {
    const clientUser = await ClientUser.findOne({ email: normalizedEmail })
      .select('+password')
      .populate('client', 'clientName');

    if (!clientUser || !clientUser.portalAccessGranted) {
      return res.status(401).json({ message: 'Access denied.' });
    }

    if (!clientUser.password) {
      return res
        .status(401)
        .json({ message: 'Please set your initial password.' });
    }

    const isMatch = await clientUser.comparePassword(typeof password === 'string' ? password : '');

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      id: clientUser._id,
      clientName: (clientUser.client as any).clientName, // Add client name to token
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const setInitialPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  try {
    const clientUser = await ClientUser.findOne({ email: normalizedEmail }).populate(
      'client',
      'clientName'
    );

    if (!clientUser || !clientUser.portalAccessGranted || clientUser.password) {
      return res.status(400).json({ message: 'Invalid request.' });
    }

    clientUser.password = typeof password === 'string' ? password : '';
    await clientUser.save();

    const payload = {
      id: clientUser._id,
      clientName: (clientUser.client as any).clientName, // Add client name to token
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error setting initial password.' });
  }
};
