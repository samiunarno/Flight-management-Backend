"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailReminderJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const bookingService_1 = require("../services/bookingService");
const email_1 = require("../utils/email");
const startEmailReminderJob = () => {
    node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('Running email reminder job...');
        try {
            const upcomingFlights = await bookingService_1.BookingService.getUpcomingFlights();
            for (const booking of upcomingFlights) {
                const flightDetails = {
                    passengerName: booking.userId.name,
                    flightNumber: booking.flightId.flightNumber,
                    route: `${booking.flightId.departureAirport} → ${booking.flightId.arrivalAirport}`,
                    departureTime: booking.flightId.departureTime.toLocaleString()
                };
                try {
                    await (0, email_1.sendFlightReminder)(booking.userId.email, flightDetails);
                    console.log(`Reminder sent to ${booking.userId.email} for flight ${booking.flightId.flightNumber}`);
                }
                catch (emailError) {
                    console.error(`Failed to send reminder to ${booking.userId.email}:`, emailError);
                }
            }
            console.log(`Email reminder job completed. Processed ${upcomingFlights.length} bookings.`);
        }
        catch (error) {
            console.error('Error in email reminder job:', error);
        }
    });
    console.log('Email reminder job scheduled to run every hour');
};
exports.startEmailReminderJob = startEmailReminderJob;
//# sourceMappingURL=emailReminders.js.map