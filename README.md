# Flight Ticket Booking Backend

A comprehensive backend system for flight ticket booking built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin, Airline Staff, Agent, Customer)
- Secure middleware for route protection

### Flight Management
- Advanced flight search with filters (price, airline, time)
- Direct and connecting flight search capabilities
- Real-time seat availability tracking
- Flight CRUD operations for authorized users

### Booking System
- Seat reservation with 10-minute timeout
- Automatic seat release if payment not completed
- Multi-passenger booking support
- Booking confirmation and cancellation

### Payment Integration
- Payment tracking and status management
- Transaction ID generation and validation
- Refund handling for cancellations

### Email Notifications
- Booking confirmation emails
- Flight reminder emails (24 hours before departure)
- Automated cron job for reminder scheduling

### Admin Panel Features
- User management and role assignment
- Airline management
- Comprehensive reporting (bookings, revenue, user stats)
- System analytics and insights

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flight-booking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET="your-secure-jwt-secret-key"
   JWT_EXPIRES_IN=7d
   
   # MongoDB Connection
   MONGO_URI="your-mongodb-connection-string"
   
   # Email Configuration
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-email-password"
   
   # Reservation Settings
   RESERVATION_TIMEOUT="10"
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Customer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <your-jwt-token>
```

### Flight Endpoints

#### Search Flights
```http
GET /flights/search?departureAirport=JFK&arrivalAirport=LAX&departureDate=2024-01-15&passengers=2&class=Economy
```

#### Get Flight Details
```http
GET /flights/:flightId
```

#### Create Flight (Admin/Airline Staff)
```http
POST /flights
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "airlineId": "airline-object-id",
  "flightNumber": "AA123",
  "departureAirport": "JFK",
  "arrivalAirport": "LAX",
  "departureTime": "2024-01-15T10:00:00Z",
  "arrivalTime": "2024-01-15T14:00:00Z",
  "price": 299.99,
  "totalSeats": 180,
  "class": "Economy"
}
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "flightId": "flight-object-id",
  "seatsBooked": 2,
  "passengerDetails": [
    {
      "name": "John Doe",
      "age": 30,
      "gender": "Male"
    },
    {
      "name": "Jane Doe",
      "age": 28,
      "gender": "Female"
    }
  ],
  "paymentMethod": "Credit Card"
}
```

#### Confirm Payment
```http
POST /bookings/:bookingId/confirm-payment
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "transactionId": "txn_1234567890"
}
```

#### Get User Bookings
```http
GET /bookings
Authorization: Bearer <your-jwt-token>
```

#### Cancel Booking
```http
PUT /bookings/:bookingId/cancel
Authorization: Bearer <your-jwt-token>
```

### Admin Endpoints

#### Get All Users
```http
GET /admin/users?page=1&limit=10&role=Customer
Authorization: Bearer <admin-jwt-token>
```

#### Create Airline
```http
POST /admin/airlines
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "American Airlines",
  "code": "AA",
  "country": "United States"
}
```

#### Get Booking Reports
```http
GET /admin/reports/bookings?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
Authorization: Bearer <admin-jwt-token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Customer**: Can search flights, create bookings, manage own bookings
- **Agent**: Same as Customer + can manage bookings for others
- **Airline Staff**: Can manage flights for their airline
- **Admin**: Full system access, user management, reports

## 🗄️ Database Schema

### User Schema
```typescript
{
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Airline Staff' | 'Agent' | 'Customer';
  createdAt: Date;
}
```

### Flight Schema
```typescript
{
  airlineId: ObjectId;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  class: 'Economy' | 'Business' | 'First';
  status: 'Scheduled' | 'Delayed' | 'Cancelled' | 'Completed';
}
```

### Booking Schema
```typescript
{
  userId: ObjectId;
  flightId: ObjectId;
  seatsBooked: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  reservationExpiry: Date;
  totalAmount: number;
  passengerDetails: [{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    seatNumber?: string;
  }];
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `MONGO_URI` | MongoDB connection string | Required |
| `EMAIL_HOST` | SMTP server host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP server port | 587 |
| `EMAIL_USER` | Email username | Required |
| `EMAIL_PASS` | Email password | Required |
| `RESERVATION_TIMEOUT` | Seat reservation timeout (minutes) | 10 |

### Database Indexes

For optimal performance, create the following indexes:

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true })

// Flight indexes
db.flights.createIndex({ flightNumber: 1 }, { unique: true })
db.flights.createIndex({ departureAirport: 1, arrivalAirport: 1, departureTime: 1 })
db.flights.createIndex({ departureTime: 1 })

// Booking indexes
db.bookings.createIndex({ userId: 1 })
db.bookings.createIndex({ flightId: 1 })
db.bookings.createIndex({ reservationExpiry: 1 })
```

## 📊 Monitoring & Logging

The application includes:
- Morgan HTTP request logging
- Comprehensive error handling
- Health check endpoint (`/api/health`)
- Structured JSON responses
- Database connection monitoring

## 🔄 Cron Jobs

### Email Reminders
- **Schedule**: Every hour (`0 * * * *`)
- **Purpose**: Send flight reminder emails 24 hours before departure
- **Process**: Queries confirmed bookings with flights departing tomorrow

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 📝 API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (when applicable)
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MONGO_URI in .env file
   - Check network connectivity
   - Ensure MongoDB is running

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header format

3. **Email Not Sending**
   - Verify email credentials in .env
   - Check SMTP server settings
   - Enable less secure apps (Gmail)

4. **Seat Reservation Issues**
   - Check RESERVATION_TIMEOUT setting
   - Verify flight availability
   - Monitor booking expiry process

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.