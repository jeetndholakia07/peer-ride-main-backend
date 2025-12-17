import mongoose from "mongoose";

const driverRatingSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    drive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drive",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String
    }
}, { timestamps: true });

const DriverRating = mongoose.model("DriverRating", driverRatingSchema);

export default DriverRating;