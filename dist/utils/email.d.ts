export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendBookingConfirmation: (email: string, bookingDetails: any) => Promise<void>;
export declare const sendFlightReminder: (email: string, flightDetails: any) => Promise<void>;
//# sourceMappingURL=email.d.ts.map