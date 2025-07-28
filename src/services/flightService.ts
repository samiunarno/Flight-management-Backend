import Flight, { IFlight } from '../models/Flight';
import Airline from '../models/Airline';
import { PaginationOptions, createPaginationResult, PaginationResult } from '../utils/pagination';

export interface FlightSearchQuery {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  class?: string;
}

export interface FlightSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  airline?: string;
  departureTimeStart?: string;
  departureTimeEnd?: string;
}

export class FlightService {
  static async searchFlights(
    query: FlightSearchQuery,
    filters: FlightSearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<IFlight>> {
    const {
      departureAirport,
      arrivalAirport,
      departureDate,
      passengers,
      class: flightClass
    } = query;

    // Build search criteria
    const searchCriteria: any = {
      departureAirport: departureAirport.toUpperCase(),
      arrivalAirport: arrivalAirport.toUpperCase(),
      seatsAvailable: { $gte: passengers },
      status: 'Scheduled',
      departureTime: {
        $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
        $lt: new Date(departureDate.setHours(23, 59, 59, 999))
      }
    };

    if (flightClass) {
      searchCriteria.class = flightClass;
    }

    // Apply filters
    if (filters.minPrice || filters.maxPrice) {
      searchCriteria.price = {};
      if (filters.minPrice) searchCriteria.price.$gte = filters.minPrice;
      if (filters.maxPrice) searchCriteria.price.$lte = filters.maxPrice;
    }

    if (filters.airline) {
      const airline = await Airline.findOne({ code: filters.airline.toUpperCase() });
      if (airline) {
        searchCriteria.airlineId = airline._id;
      }
    }

    if (filters.departureTimeStart || filters.departureTimeEnd) {
      const startTime = filters.departureTimeStart ? new Date(`1970-01-01T${filters.departureTimeStart}:00.000Z`) : new Date('1970-01-01T00:00:00.000Z');
      const endTime = filters.departureTimeEnd ? new Date(`1970-01-01T${filters.departureTimeEnd}:00.000Z`) : new Date('1970-01-01T23:59:59.999Z');
      
      searchCriteria.$expr = {
        $and: [
          { $gte: [{ $dateToString: { format: "%H:%M", date: "$departureTime" } }, startTime.toISOString().substr(11, 5)] },
          { $lte: [{ $dateToString: { format: "%H:%M", date: "$departureTime" } }, endTime.toISOString().substr(11, 5)] }
        ]
      };
    }

    // Pagination setup
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    const sort = pagination.sort || 'price'; // Default sort by price (cheapest first)

    // Execute search with pagination
    const [flights, totalCount] = await Promise.all([
      Flight.find(searchCriteria)
        .populate('airlineId', 'name code')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Flight.countDocuments(searchCriteria)
    ]);

    return createPaginationResult(flights as IFlight[], totalCount, page, limit);
  }

  static async findConnectingFlights(
    query: FlightSearchQuery,
    filters: FlightSearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<{ outbound: IFlight; connecting: IFlight }>> {
    const {
      departureAirport,
      arrivalAirport,
      departureDate,
      passengers
    } = query;

    // Find all possible intermediate airports
    const intermediateAirports = await Flight.distinct('arrivalAirport', {
      departureAirport: departureAirport.toUpperCase(),
      seatsAvailable: { $gte: passengers },
      status: 'Scheduled',
      departureTime: {
        $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
        $lt: new Date(departureDate.setHours(23, 59, 59, 999))
      }
    });

    const connectingFlights: Array<{ outbound: IFlight; connecting: IFlight }> = [];

    for (const intermediate of intermediateAirports) {
      if (intermediate === arrivalAirport.toUpperCase()) continue;

      // Find outbound flights to intermediate airport
      const outboundFlights = await Flight.find({
        departureAirport: departureAirport.toUpperCase(),
        arrivalAirport: intermediate,
        seatsAvailable: { $gte: passengers },
        status: 'Scheduled',
        departureTime: {
          $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
          $lt: new Date(departureDate.setHours(23, 59, 59, 999))
        }
      }).populate('airlineId', 'name code');

      for (const outbound of outboundFlights) {
        // Find connecting flights from intermediate to destination
        // Allow minimum 2 hours layover
        const minConnectingTime = new Date(outbound.arrivalTime.getTime() + 2 * 60 * 60 * 1000);
        const maxConnectingTime = new Date(departureDate.setHours(23, 59, 59, 999));

        const connecting = await Flight.findOne({
          departureAirport: intermediate,
          arrivalAirport: arrivalAirport.toUpperCase(),
          seatsAvailable: { $gte: passengers },
          status: 'Scheduled',
          departureTime: {
            $gte: minConnectingTime,
            $lte: maxConnectingTime
          }
        }).populate('airlineId', 'name code');

        if (connecting) {
          connectingFlights.push({
            outbound: outbound as IFlight,
            connecting: connecting as IFlight
          });
        }
      }
    }

    // Sort by total price
    connectingFlights.sort((a, b) => (a.outbound.price + a.connecting.price) - (b.outbound.price + b.connecting.price));

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    const paginatedFlights = connectingFlights.slice(skip, skip + limit);

    return createPaginationResult(paginatedFlights, connectingFlights.length, page, limit);
  }

  static async getFlightById(flightId: string): Promise<IFlight | null> {
    return Flight.findById(flightId).populate('airlineId', 'name code country');
  }

  static async createFlight(flightData: Partial<IFlight>): Promise<IFlight> {
    const flight = new Flight(flightData);
    return flight.save();
  }

  static async updateFlight(flightId: string, updateData: Partial<IFlight>): Promise<IFlight | null> {
    return Flight.findByIdAndUpdate(flightId, updateData, { new: true, runValidators: true });
  }

  static async deleteFlight(flightId: string): Promise<boolean> {
    const result = await Flight.findByIdAndDelete(flightId);
    return !!result;
  }

  static async getFlightsByAirline(airlineId: string): Promise<IFlight[]> {
    return Flight.find({ airlineId }).populate('airlineId', 'name code');
  }
}