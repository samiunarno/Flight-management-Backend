import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongoUri: process.env.MONGO_URI as string,
  email: {
    host: process.env.EMAIL_HOST as string,
    port: parseInt(process.env.EMAIL_PORT as string) || 587,
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
  reservationTimeout: parseInt(process.env.RESERVATION_TIMEOUT as string) || 10,
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}