import mongoose from "mongoose";

const driverStatsSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    averageRating: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const DriverStat = mongoose.model("DriverStat", driverStatsSchema);

export default DriverStat;