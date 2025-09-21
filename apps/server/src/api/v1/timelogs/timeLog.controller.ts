import { type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.middleware.js';
import { User } from '../auth/user.model.js';
import { Schedule } from '../schedules/schedule.model.js';
import { TimeLog } from './timeLog.model.js';
import { ClockInRequest } from '../requests/clockInRequest.model.js';
import mongoose from 'mongoose';

// @desc    Clock in an employee
// @route   POST /api/v1/timelogs/clock-in
export const clockIn = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (user.isClockedIn) {
    return res.status(400).json({ message: 'User is already clocked in.' });
  }

  const now = new Date();
  let canClockIn = false;
  let scheduleId = null;
  let isOverride = false;

  // 1. Check for a published schedule
  const activeSchedule = await Schedule.findOne({
    user: user._id,
    startTime: { $lte: now },
    endTime: { $gte: now },
    status: 'Published',
  });

  if (activeSchedule) {
    canClockIn = true;
    scheduleId = activeSchedule._id;
  } else {
    // 2. If no schedule, check for an approved override request
    const approvedRequest = await ClockInRequest.findOne({
      user: user._id,
      status: 'Approved',
    });

    if (approvedRequest) {
      canClockIn = true;
      isOverride = true;
      // Optional: Consume the request after use
      await approvedRequest.deleteOne();
    }
  }

  if (!canClockIn) {
    return res.status(403).json({
      message: 'Not scheduled to work or no approved override found.',
    });
  }

  // Start transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newTimeLog = new TimeLog({
      user: user._id,
      schedule: scheduleId,
      clockInTime: now,
      isApprovedOverride: isOverride,
    });
    await newTimeLog.save({ session });

    user.isClockedIn = true;
    user.activeTimeLog = newTimeLog._id as mongoose.Types.ObjectId;
    await user.save({ session });

    await session.commitTransaction();
    res
      .status(200)
      .json({ message: 'Clocked in successfully.', timeLog: newTimeLog });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error during clock-in.' });
  } finally {
    session.endSession();
  }
};

// @desc    Clock out an employee
// @route   POST /api/v1/timelogs/clock-out
export const clockOut = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  if (!user.isClockedIn || !user.activeTimeLog) {
    return res.status(400).json({ message: 'User is not clocked in.' });
  }

  const now = new Date();
  const timeLog = await TimeLog.findById(user.activeTimeLog);

  if (!timeLog) {
    // Data inconsistency, correct user state
    user.isClockedIn = false;
    user.set('activeTimeLog', undefined);
    await user.save();
    return res.status(404).json({ message: 'Active time log not found.' });
  }

  const duration =
    (now.getTime() - timeLog.clockInTime.getTime()) / (1000 * 60); // in minutes

  timeLog.clockOutTime = now;
  timeLog.duration = Math.round(duration);

  user.isClockedIn = false;
  user.set('activeTimeLog', undefined);

  await timeLog.save();
  await user.save();

  res.status(200).json({ message: 'Clocked out successfully.', timeLog });
};

// @desc    Get user's current clock-in status and logs
// @route   GET /api/v1/timelogs/status
export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const timeLogs = await TimeLog.find({ user: user._id })
      .sort({ clockInTime: -1 })
      .limit(10);

    const upcomingSchedule = await Schedule.findOne({
      user: user._id,
      startTime: { $gt: new Date() },
      status: 'Published',
    }).sort({ startTime: 'asc' });

    res.status(200).json({
      isClockedIn: user.isClockedIn,
      activeTimeLog: user.activeTimeLog,
      recentLogs: timeLogs,
      upcomingSchedule: upcomingSchedule,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status.' });
  }
};
