import mongoose from "mongoose";

const frequentRideSchema = new mongoose.Schema({
    from: {
        address: { type: String, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    // Dropoff Location 
    to: {
        address: { type: String, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
}, { timestamps: true });

const FrequentRide = mongoose.model("FrequentRide", frequentRideSchema);

export default FrequentRide;