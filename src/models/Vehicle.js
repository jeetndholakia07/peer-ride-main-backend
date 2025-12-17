import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vehicleDetails: {
        vehicleType: { type: String },
        vehicleName: { type: String },
        vehicleNumber: { type: String },
        fuelType: { type: String, required: true },
        isAc: { type: Boolean, required: true }
    },
    isSaved: {
        type: Boolean,
        default: false
    }
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;