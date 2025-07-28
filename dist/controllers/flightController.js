"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightController = void 0;
const flightService_1 = require("../services/flightService");
const pagination_1 = require("../utils/pagination");
class FlightController {
    static async searchFlights(req, res) {
        try {
            const { departureAirport, arrivalAirport, departureDate, returnDate, passengers = 1, class: flightClass } = req.query;
            const filters = {
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
                airline: req.query.airline,
                departureTimeStart: req.query.departureTimeStart,
                departureTimeEnd: req.query.departureTimeEnd
            };
            const pagination = (0, pagination_1.getPaginationOptions)(req.query);
            const searchQuery = {
                departureAirport: departureAirport,
                arrivalAirport: arrivalAirport,
                departureDate: new Date(departureDate),
                returnDate: returnDate ? new Date(returnDate) : undefined,
                passengers: parseInt(passengers),
                class: flightClass
            };
            const directFlights = await flightService_1.FlightService.searchFlights(searchQuery, filters, pagination);
            let connectingFlights = null;
            if (req.query.includeConnecting === 'true' || directFlights.data.length === 0) {
                connectingFlights = await flightService_1.FlightService.findConnectingFlights(searchQuery, filters, pagination);
            }
            res.status(200).json({
                success: true,
                message: 'Flight search completed',
                data: {
                    direct: directFlights,
                    connecting: connectingFlights
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Flight search failed'
            });
            return;
        }
    }
    static async getFlightDetails(req, res) {
        try {
            const { flightId } = req.params;
            const flight = await flightService_1.FlightService.getFlightById(flightId);
            if (!flight) {
                res.status(404).json({
                    success: false,
                    message: 'Flight not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Flight details retrieved successfully',
                data: { flight }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve flight details'
            });
            return;
        }
    }
    static async createFlight(req, res) {
        try {
            const flightData = req.body;
            const flight = await flightService_1.FlightService.createFlight(flightData);
            res.status(201).json({
                success: true,
                message: 'Flight created successfully',
                data: { flight }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create flight'
            });
            return;
        }
    }
    static async updateFlight(req, res) {
        try {
            const { flightId } = req.params;
            const updateData = req.body;
            const flight = await flightService_1.FlightService.updateFlight(flightId, updateData);
            if (!flight) {
                res.status(404).json({
                    success: false,
                    message: 'Flight not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Flight updated successfully',
                data: { flight }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update flight'
            });
            return;
        }
    }
    static async deleteFlight(req, res) {
        try {
            const { flightId } = req.params;
            const deleted = await flightService_1.FlightService.deleteFlight(flightId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Flight not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Flight deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete flight'
            });
            return;
        }
    }
    static async getFlightsByAirline(req, res) {
        try {
            const { airlineId } = req.params;
            const flights = await flightService_1.FlightService.getFlightsByAirline(airlineId);
            res.status(200).json({
                success: true,
                message: 'Airline flights retrieved successfully',
                data: { flights }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve airline flights'
            });
            return;
        }
    }
}
exports.FlightController = FlightController;
//# sourceMappingURL=flightController.js.map