import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `Flight Booking System <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendBookingConfirmation = async (
  email: string,
  bookingDetails: any
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>Dear ${bookingDetails.passengerName},</p>
      <p>Your flight booking has been confirmed!</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p><strong>Flight:</strong> ${bookingDetails.flightNumber}</p>
        <p><strong>Route:</strong> ${bookingDetails.route}</p>
        <p><strong>Departure:</strong> ${bookingDetails.departureTime}</p>
        <p><strong>Seats:</strong> ${bookingDetails.seatsBooked}</p>
        <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
      </div>
      
      <p>Please arrive at the airport at least 2 hours before departure.</p>
      <p>Thank you for choosing our service!</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Flight Booking Confirmation',
    html,
  });
};

export const sendFlightReminder = async (
  email: string,
  flightDetails: any
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Flight Reminder</h2>
      <p>Dear ${flightDetails.passengerName},</p>
      <p>This is a reminder that your flight is scheduled to depart in 24 hours.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3>Flight Details:</h3>
        <p><strong>Flight:</strong> ${flightDetails.flightNumber}</p>
        <p><strong>Route:</strong> ${flightDetails.route}</p>
        <p><strong>Departure:</strong> ${flightDetails.departureTime}</p>
        <p><strong>Gate:</strong> TBA</p>
      </div>
      
      <p><strong>Important Reminders:</strong></p>
      <ul>
        <li>Arrive at the airport at least 2 hours before departure</li>
        <li>Have your ID and boarding pass ready</li>
        <li>Check baggage restrictions</li>
        <li>Complete web check-in to save time</li>
      </ul>
      
      <p>Have a safe flight!</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Flight Reminder - Departure in 24 Hours',
    html,
  });
};