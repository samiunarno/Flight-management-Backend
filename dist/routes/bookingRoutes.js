"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/', (0, validation_1.validate)(validation_1.bookingSchema), bookingController_1.BookingController.createBooking);
router.post('/:bookingId/confirm-payment', bookingController_1.BookingController.confirmPayment);
router.put('/:bookingId/cancel', bookingController_1.BookingController.cancelBooking);
router.get('/', bookingController_1.BookingController.getUserBookings);
router.get('/:bookingId', bookingController_1.BookingController.getBookingDetails);
exports.default = router;
//# sourceMappingURL=bookingRoutes.js.map