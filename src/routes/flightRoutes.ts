import express from 'express';
import { FlightController } from '../controllers/flightController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateQuery, flightSearchSchema } from '../middlewares/validation';

const router = express.Router();

// Public routes
router.get('/search', validateQuery(flightSearchSchema), FlightController.searchFlights);
router.get('/:flightId', FlightController.getFlightDetails);

// Protected routes (Admin/Airline Staff only)
router.post('/', authenticate, authorize('Admin', 'Airline Staff'), FlightController.createFlight);
router.put('/:flightId', authenticate, authorize('Admin', 'Airline Staff'), FlightController.updateFlight);
router.delete('/:flightId', authenticate, authorize('Admin'), FlightController.deleteFlight);
router.get('/airline/:airlineId', authenticate, authorize('Admin', 'Airline Staff'), FlightController.getFlightsByAirline);

export default router;