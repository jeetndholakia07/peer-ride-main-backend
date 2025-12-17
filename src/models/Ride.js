import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    drive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drive",
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
    driverStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    seats: {
        type: Number,
        required: true
    },
    amountRequested: {
        type: Number
    },
    acceptedAt: {
        type: Date
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    rejectedAt: {
        type: Date
    }
}, { timestamps: true });

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;