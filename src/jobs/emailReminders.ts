import cron from 'node-cron';
import { BookingService } from '../services/bookingService';
import { sendFlightReminder } from '../utils/email';

// Send flight reminders 24 hours before departure
// Runs every hour to check for upcoming flights
export const startEmailReminderJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running email reminder job...');
    
    try {
      const upcomingFlights = await BookingService.getUpcomingFlights();
      
      for (const booking of upcomingFlights) {
        const flightDetails = {
          passengerName: booking.userId.name,
          flightNumber: booking.flightId.flightNumber,
          route: `${booking.flightId.departureAirport} → ${booking.flightId.arrivalAirport}`,
          departureTime: booking.flightId.departureTime.toLocaleString()
        };

        try {
          await sendFlightReminder(booking.userId.email, flightDetails);
          console.log(`Reminder sent to ${booking.userId.email} for flight ${booking.flightId.flightNumber}`);
        } catch (emailError) {
          console.error(`Failed to send reminder to ${booking.userId.email}:`, emailError);
        }
      }
      
      console.log(`Email reminder job completed. Processed ${upcomingFlights.length} bookings.`);
    } catch (error) {
      console.error('Error in email reminder job:', error);
    }
  });

  console.log('Email reminder job scheduled to run every hour');
};