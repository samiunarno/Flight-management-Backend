import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`
🚀 Flight Booking Backend Server Started Successfully!
📍 Server running on port ${config.port}
🌍 Environment: ${config.nodeEnv}
📊 Health Check: http://localhost:${config.port}/api/health
📚 API Base URL: http://localhost:${config.port}/api

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
⏰ Seat reservations expire after ${config.reservationTimeout} minutes
  `);
});

// Graceful shutdown
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