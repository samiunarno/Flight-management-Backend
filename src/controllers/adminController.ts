import { Request, Response } from 'express';
import User from '../models/User';
import Airline from '../models/Airline';
import Flight from '../models/Flight';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import { AuthRequest } from '../middlewares/auth';
import { getPaginationOptions, createPaginationResult } from '../utils/pagination';

export class AdminController {
  // User Management
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const pagination = getPaginationOptions(req.query);
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.role) {
        filter.role = req.query.role;
      }
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [users, totalCount] = await Promise.all([
        User.find(filter)
          .select('-passwordHash')
          .sort('-createdAt')
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter)
      ]);

      const result = createPaginationResult(users, totalCount, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve users'
      });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user role'
      });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  // Airline Management
  static async createAirline(req: AuthRequest, res: Response) {
    try {
      const airline = new Airline(req.body);
      await airline.save();

      return res.status(201).json({
        success: true,
        message: 'Airline created successfully',
        data: { airline }
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create airline'
      });
    }
  }

  static async getAllAirlines(req: AuthRequest, res: Response) {
    try {
      const airlines = await Airline.find().sort('name');

      return res.status(200).json({
        success: true,
        message: 'Airlines retrieved successfully',
        data: { airlines }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve airlines'
      });
    }
  }

  static async updateAirline(req: AuthRequest, res: Response) {
    try {
      const { airlineId } = req.params;

      const airline = await Airline.findByIdAndUpdate(
        airlineId,
        req.body,
        { new: true, runValidators: true }
      );

      if (!airline) {
        return res.status(404).json({
          success: false,
          message: 'Airline not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Airline updated successfully',
        data: { airline }
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update airline'
      });
    }
  }

  static async deleteAirline(req: AuthRequest, res: Response) {
    try {
      const { airlineId } = req.params;

      // Check if airline has associated flights
      const flightCount = await Flight.countDocuments({ airlineId });
      if (flightCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete airline with existing flights'
        });
      }

      const airline = await Airline.findByIdAndDelete(airlineId);

      if (!airline) {
        return res.status(404).json({
          success: false,
          message: 'Airline not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Airline deleted successfully'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete airline'
      });
    }
  }

  // Reports
  static async getBookingReports(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const matchStage: any = {};
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      const groupFormat = groupBy === 'month' 
        ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
        : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

      const bookingStats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupFormat,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
      ]);

      const totalStats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgBookingValue: { $avg: '$totalAmount' }
          }
        }
      ]);

      return res.status(200).json({
        success: true,
        message: 'Booking reports retrieved successfully',
        data: {
          summary: totalStats[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 },
          chartData: bookingStats
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate booking reports'
      });
    }
  }

  static async getRevenueReports(req: AuthRequest, res: Response) {
    try {
      const revenueByAirline = await Payment.aggregate([
        { $match: { status: 'Completed' } },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking'
          }
        },
        { $unwind: '$booking' },
        {
          $lookup: {
            from: 'flights',
            localField: 'booking.flightId',
            foreignField: '_id',
            as: 'flight'
          }
        },
        { $unwind: '$flight' },
        {
          $lookup: {
            from: 'airlines',
            localField: 'flight.airlineId',
            foreignField: '_id',
            as: 'airline'
          }
        },
        { $unwind: '$airline' },
        {
          $group: {
            _id: '$airline.name',
            totalRevenue: { $sum: '$amount' },
            totalBookings: { $sum: 1 },
            avgBookingValue: { $avg: '$amount' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      const monthlyRevenue = await Payment.aggregate([
        { $match: { status: 'Completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      return res.status(200).json({
        success: true,
        message: 'Revenue reports retrieved successfully',
        data: {
          revenueByAirline,
          monthlyRevenue
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate revenue reports'
      });
    }
  }

  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      const userStats = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentUsers = await User.find()
        .select('-passwordHash')
        .sort('-createdAt')
        .limit(10);

      const totalUsers = await User.countDocuments();

      return res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          totalUsers,
          usersByRole: userStats,
          recentUsers
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve user statistics'
      });
    }
  }
}
