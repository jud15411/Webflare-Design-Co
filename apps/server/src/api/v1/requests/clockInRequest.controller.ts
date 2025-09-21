import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { ClockInRequest } from './clockInRequest.model.js';

// @desc    Create a clock-in override request
// @route   POST /api/v1/requests/clock-in
export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required.' });
    }
    const request = new ClockInRequest({ user: req.user!._id, reason });
    await request.save();
    res.status(201).json({ message: 'Request submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request.' });
  }
};

// @desc    Get all pending requests (Admin)
// @route   GET /api/v1/requests/clock-in
export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await ClockInRequest.find({ status: 'Pending' }).populate(
      'user',
      'name email'
    );
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests.' });
  }
};

// @desc    Approve or deny a request (Admin)
// @route   PATCH /api/v1/requests/clock-in/:id
export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // Expects 'Approved' or 'Denied'
    if (!['Approved', 'Denied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const request = await ClockInRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    request.status = status;
    await request.save();
    res
      .status(200)
      .json({ message: `Request has been ${status.toLowerCase()}.` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request.' });
  }
};
