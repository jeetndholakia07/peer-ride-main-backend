import mongoose from "mongoose";

const driveSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    from: {
        address: String,
        location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] }
    },
    to: {
        address: String,
        location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] }
    },
    departureTime: {
        type: Date,
        required: true
    },
    seatsAvailable: {
        type: Number,
        required: true
    },
    driveStatus: {
        type: String,
        enum: ["pending", "cancelled", "completed"],
        default: "pending"
    },
    estimatedTimeMin: {
        type: Number
    },
    distanceKm: {
        type: Number
    },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
    vehicleDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    pricePerPerson: {
        type: Number,
        required: true
    },
    specialNote: { type: String }
}, { timestamps: true });

// ---- Create geospatial indexes 
driveSchema.index({ "from.location": "2dsphere" });
driveSchema.index({ "to.location": "2dsphere" });

const Drive = mongoose.model("Drive", driveSchema);

export default Drive;