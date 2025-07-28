"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = require("./middlewares/errorHandler");
const emailReminders_1 = require("./jobs/emailReminders");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const flightRoutes_1 = __importDefault(require("./routes/flightRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, database_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined'));
}
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Flight Booking API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/flights', flightRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
(0, emailReminders_1.startEmailReminderJob)();
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map