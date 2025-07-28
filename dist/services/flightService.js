"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightService = void 0;
const Flight_1 = __importDefault(require("../models/Flight"));
const Airline_1 = __importDefault(require("../models/Airline"));
const pagination_1 = require("../utils/pagination");
class FlightService {
    static async searchFlights(query, filters = {}, pagination = {}) {
        const { departureAirport, arrivalAirport, departureDate, passengers, class: flightClass } = query;
        const searchCriteria = {
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
        if (filters.minPrice || filters.maxPrice) {
            searchCriteria.price = {};
            if (filters.minPrice)
                searchCriteria.price.$gte = filters.minPrice;
            if (filters.maxPrice)
                searchCriteria.price.$lte = filters.maxPrice;
        }
        if (filters.airline) {
            const airline = await Airline_1.default.findOne({ code: filters.airline.toUpperCase() });
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
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const skip = (page - 1) * limit;
        const sort = pagination.sort || 'price';
        const [flights, totalCount] = await Promise.all([
            Flight_1.default.find(searchCriteria)
                .populate('airlineId', 'name code')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Flight_1.default.countDocuments(searchCriteria)
        ]);
        return (0, pagination_1.createPaginationResult)(flights, totalCount, page, limit);
    }
    static async findConnectingFlights(query, filters = {}, pagination = {}) {
        const { departureAirport, arrivalAirport, departureDate, passengers } = query;
        const intermediateAirports = await Flight_1.default.distinct('arrivalAirport', {
            departureAirport: departureAirport.toUpperCase(),
            seatsAvailable: { $gte: passengers },
            status: 'Scheduled',
            departureTime: {
                $gte: new Date(departureDate.setHours(0, 0, 0, 0)),
                $lt: new Date(departureDate.setHours(23, 59, 59, 999))
            }
        });
        const connectingFlights = [];
        for (const intermediate of intermediateAirports) {
            if (intermediate === arrivalAirport.toUpperCase())
                continue;
            const outboundFlights = await Flight_1.default.find({
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
                const minConnectingTime = new Date(outbound.arrivalTime.getTime() + 2 * 60 * 60 * 1000);
                const maxConnectingTime = new Date(departureDate.setHours(23, 59, 59, 999));
                const connecting = await Flight_1.default.findOne({
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
                        outbound: outbound,
                        connecting: connecting
                    });
                }
            }
        }
        connectingFlights.sort((a, b) => (a.outbound.price + a.connecting.price) - (b.outbound.price + b.connecting.price));
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const skip = (page - 1) * limit;
        const paginatedFlights = connectingFlights.slice(skip, skip + limit);
        return (0, pagination_1.createPaginationResult)(paginatedFlights, connectingFlights.length, page, limit);
    }
    static async getFlightById(flightId) {
        return Flight_1.default.findById(flightId).populate('airlineId', 'name code country');
    }
    static async createFlight(flightData) {
        const flight = new Flight_1.default(flightData);
        return flight.save();
    }
    static async updateFlight(flightId, updateData) {
        return Flight_1.default.findByIdAndUpdate(flightId, updateData, { new: true, runValidators: true });
    }
    static async deleteFlight(flightId) {
        const result = await Flight_1.default.findByIdAndDelete(flightId);
        return !!result;
    }
    static async getFlightsByAirline(airlineId) {
        return Flight_1.default.find({ airlineId }).populate('airlineId', 'name code');
    }
}
exports.FlightService = FlightService;
//# sourceMappingURL=flightService.js.map