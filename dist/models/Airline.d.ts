import mongoose, { Document } from 'mongoose';
export interface IAirline extends Document {
    name: string;
    code: string;
    country: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAirline, {}, {}, {}, mongoose.Document<unknown, {}, IAirline, {}> & IAirline & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Airline.d.ts.map