"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const User_1 = __importDefault(require("../models/User"));
const Airline_1 = __importDefault(require("../models/Airline"));
const Flight_1 = __importDefault(require("../models/Flight"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Payment_1 = __importDefault(require("../models/Payment"));
const pagination_1 = require("../utils/pagination");
class AdminController {
    static async getAllUsers(req, res) {
        try {
            const pagination = (0, pagination_1.getPaginationOptions)(req.query);
            const { page = 1, limit = 10 } = pagination;
            const skip = (page - 1) * limit;
            const filter = {};
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
                User_1.default.find(filter)
                    .select('-passwordHash')
                    .sort('-createdAt')
                    .skip(skip)
                    .limit(limit),
                User_1.default.countDocuments(filter)
            ]);
            const result = (0, pagination_1.createPaginationResult)(users, totalCount, page, limit);
            return res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: result
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve users'
            });
        }
    }
    static async updateUserRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const user = await User_1.default.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select('-passwordHash');
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
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to update user role'
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await User_1.default.findByIdAndDelete(userId);
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete user'
            });
        }
    }
    static async createAirline(req, res) {
        try {
            const airline = new Airline_1.default(req.body);
            await airline.save();
            return res.status(201).json({
                success: true,
                message: 'Airline created successfully',
                data: { airline }
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to create airline'
            });
        }
    }
    static async getAllAirlines(req, res) {
        try {
            const airlines = await Airline_1.default.find().sort('name');
            return res.status(200).json({
                success: true,
                message: 'Airlines retrieved successfully',
                data: { airlines }
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve airlines'
            });
        }
    }
    static async updateAirline(req, res) {
        try {
            const { airlineId } = req.params;
            const airline = await Airline_1.default.findByIdAndUpdate(airlineId, req.body, { new: true, runValidators: true });
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
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to update airline'
            });
        }
    }
    static async deleteAirline(req, res) {
        try {
            const { airlineId } = req.params;
            const flightCount = await Flight_1.default.countDocuments({ airlineId });
            if (flightCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete airline with existing flights'
                });
            }
            const airline = await Airline_1.default.findByIdAndDelete(airlineId);
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete airline'
            });
        }
    }
    static async getBookingReports(req, res) {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;
            const matchStage = {};
            if (startDate && endDate) {
                matchStage.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            const groupFormat = groupBy === 'month'
                ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
                : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
            const bookingStats = await Booking_1.default.aggregate([
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
            const totalStats = await Booking_1.default.aggregate([
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate booking reports'
            });
        }
    }
    static async getRevenueReports(req, res) {
        try {
            const revenueByAirline = await Payment_1.default.aggregate([
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
            const monthlyRevenue = await Payment_1.default.aggregate([
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
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to generate revenue reports'
            });
        }
    }
    static async getUserStats(req, res) {
        try {
            const userStats = await User_1.default.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);
            const recentUsers = await User_1.default.find()
                .select('-passwordHash')
                .sort('-createdAt')
                .limit(10);
            const totalUsers = await User_1.default.countDocuments();
            return res.status(200).json({
                success: true,
                message: 'User statistics retrieved successfully',
                data: {
                    totalUsers,
                    usersByRole: userStats,
                    recentUsers
                }
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve user statistics'
            });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map