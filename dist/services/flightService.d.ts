import { IFlight } from '../models/Flight';
import { PaginationOptions, PaginationResult } from '../utils/pagination';
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
export declare class FlightService {
    static searchFlights(query: FlightSearchQuery, filters?: FlightSearchFilters, pagination?: PaginationOptions): Promise<PaginationResult<IFlight>>;
    static findConnectingFlights(query: FlightSearchQuery, filters?: FlightSearchFilters, pagination?: PaginationOptions): Promise<PaginationResult<{
        outbound: IFlight;
        connecting: IFlight;
    }>>;
    static getFlightById(flightId: string): Promise<IFlight | null>;
    static createFlight(flightData: Partial<IFlight>): Promise<IFlight>;
    static updateFlight(flightId: string, updateData: Partial<IFlight>): Promise<IFlight | null>;
    static deleteFlight(flightId: string): Promise<boolean>;
    static getFlightsByAirline(airlineId: string): Promise<IFlight[]>;
}
//# sourceMappingURL=flightService.d.ts.map