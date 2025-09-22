import { type Request, type Response } from 'express';
import { Message } from './message.model.js';

export const getMessagesForProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ project: projectId })
      .sort({ timestamp: 1 })
      .populate('sender.user', 'name')
      .populate('sender.clientUser', 'email'); // You might want to populate client name here later

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
};
