import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const connectDB = (async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "PeerRide" });
        console.log("Connected to MongoDB Atlas");
    }
    catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
});

export default connectDB;