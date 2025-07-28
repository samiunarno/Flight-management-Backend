import { Request, Response } from 'express';
import { FlightService } from '../services/flightService';
import { getPaginationOptions } from '../utils/pagination';
import { AuthRequest } from '../middlewares/auth';

export class FlightController {
  static async searchFlights(req: Request, res: Response): Promise<void> {
    try {
      const {
        departureAirport,
        arrivalAirport,
        departureDate,
        returnDate,
        passengers = 1,
        class: flightClass
      } = req.query;

      const filters = {
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        airline: req.query.airline as string,
        departureTimeStart: req.query.departureTimeStart as string,
        departureTimeEnd: req.query.departureTimeEnd as string
      };

      const pagination = getPaginationOptions(req.query);

      const searchQuery = {
        departureAirport: departureAirport as string,
        arrivalAirport: arrivalAirport as string,
        departureDate: new Date(departureDate as string),
        returnDate: returnDate ? new Date(returnDate as string) : undefined,
        passengers: parseInt(passengers as string),
        class: flightClass as string
      };

      // Search direct flights
      const directFlights = await FlightService.searchFlights(searchQuery, filters, pagination);

      // Search connecting flights if no direct flights found or if requested
      let connectingFlights = null;
      if (req.query.includeConnecting === 'true' || directFlights.data.length === 0) {
        connectingFlights = await FlightService.findConnectingFlights(searchQuery, filters, pagination);
      }

      res.status(200).json({
        success: true,
        message: 'Flight search completed',
        data: {
          direct: directFlights,
          connecting: connectingFlights
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Flight search failed'
      });
      return;
    }
  }

  static async getFlightDetails(req: Request, res: Response): Promise<void> {
    try {
      const { flightId } = req.params;

      const flight = await FlightService.getFlightById(flightId);

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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve flight details'
      });
      return;
    }
  }

  static async createFlight(req: AuthRequest, res: Response): Promise<void> {
    try {
      const flightData = req.body;

      const flight = await FlightService.createFlight(flightData);

      res.status(201).json({
        success: true,
        message: 'Flight created successfully',
        data: { flight }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create flight'
      });
      return;
    }
  }

  static async updateFlight(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { flightId } = req.params;
      const updateData = req.body;

      const flight = await FlightService.updateFlight(flightId, updateData);

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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update flight'
      });
      return;
    }
  }

  static async deleteFlight(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { flightId } = req.params;

      const deleted = await FlightService.deleteFlight(flightId);

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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete flight'
      });
      return;
    }
  }

  static async getFlightsByAirline(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { airlineId } = req.params;

      const flights = await FlightService.getFlightsByAirline(airlineId);

      res.status(200).json({
        success: true,
        message: 'Airline flights retrieved successfully',
        data: { flights }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve airline flights'
      });
      return;
    }
  }
}
