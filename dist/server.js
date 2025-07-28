"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const server = app_1.default.listen(env_1.config.port, () => {
    console.log(`
🚀 Flight Booking Backend Server Started Successfully!
📍 Server running on port ${env_1.config.port}
🌍 Environment: ${env_1.config.nodeEnv}
📊 Health Check: http://localhost:${env_1.config.port}/api/health
📚 API Base URL: http://localhost:${env_1.config.port}/api

🔑 Available Endpoints:
   • POST /api/auth/register - User registration
   • POST /api/auth/login - User login
   • GET  /api/auth/profile - Get user profile
   • GET  /api/flights/search - Search flights
   • GET  /api/flights/:id - Get flight details
   • POST /api/bookings - Create booking
   • GET  /api/bookings - Get user bookings
   • POST /api/bookings/:id/confirm-payment - Confirm payment
   • PUT  /api/bookings/:id/cancel - Cancel booking
   • GET  /api/admin/* - Admin endpoints

📧 Email reminders scheduled to run every hour
⏰ Seat reservations expire after ${env_1.config.reservationTimeout} minutes
  `);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map