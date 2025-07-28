"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flightController_1 = require("../controllers/flightController");
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../middlewares/validation");
const router = express_1.default.Router();
router.get('/search', (0, validation_1.validateQuery)(validation_1.flightSearchSchema), flightController_1.FlightController.searchFlights);
router.get('/:flightId', flightController_1.FlightController.getFlightDetails);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('Admin', 'Airline Staff'), flightController_1.FlightController.createFlight);
router.put('/:flightId', auth_1.authenticate, (0, auth_1.authorize)('Admin', 'Airline Staff'), flightController_1.FlightController.updateFlight);
router.delete('/:flightId', auth_1.authenticate, (0, auth_1.authorize)('Admin'), flightController_1.FlightController.deleteFlight);
router.get('/airline/:airlineId', auth_1.authenticate, (0, auth_1.authorize)('Admin', 'Airline Staff'), flightController_1.FlightController.getFlightsByAirline);
exports.default = router;
//# sourceMappingURL=flightRoutes.js.map