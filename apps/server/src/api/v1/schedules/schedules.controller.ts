import { type Request, type Response } from 'express';
import { Schedule } from './schedule.model.js';
import { Types } from 'mongoose';

// @desc    Create a new schedule entry
// @route   POST /api/v1/schedules
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { user, startTime, endTime, notes } = req.body;
    const schedule = new Schedule({ user, startTime, endTime, notes });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating schedule', error });
  }
};

// @desc    Get schedules for a date range (or all schedules if no dates are provided)
// @route   GET /api/v1/schedules
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    // Check if both startDate and endDate are provided before applying the date filter
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate as string) };
      query.endTime = { $lte: new Date(endDate as string) };
    }

    // Now, find schedules using the constructed query
    const schedules = await Schedule.find(query).populate('user', 'name');
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
};

// @desc    Publish draft schedules by their IDs
// @route   PATCH /api/v1/schedules/publish
export const publishSchedules = async (req: Request, res: Response) => {
  try {
    const { scheduleIds } = req.body; // Expects an array of schedule IDs
    if (!scheduleIds || !Array.isArray(scheduleIds)) {
      return res.status(400).json({ message: 'scheduleIds must be an array.' });
    }

    await Schedule.updateMany(
      { _id: { $in: scheduleIds }, status: 'Draft' },
      { $set: { status: 'Published' } }
    );
    res.status(200).json({ message: 'Schedules published successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error publishing schedules', error });
  }
};
