import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/authRoute.js";
import publicRoute from "./src/routes/publicRoute.js";
import userRoute from "./src/routes/userRoute.js";
import rideRoute from "./src/routes/rideRoute.js";
import verifyUser from "./src/middlewares/verifyUser.js";
import optionalAuth from "./src/middlewares/optionalAuth.js";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./src/socket/socketHandler.js";
import chatRoute from "./src/routes/chatRoute.js";
import adminRoute from "./src/routes/adminRoute.js";
import verifyAdmin from "./src/middlewares/verifyAdmin.js";

const app = express();

dotenv.config({ quiet: true });

const baseURL = "/peerRide/api";
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(`${baseURL}/public`, optionalAuth, publicRoute);
app.use(`${baseURL}/auth`, authRoute);
app.use(`${baseURL}/user`, verifyUser, userRoute);
app.use(`${baseURL}/ride`, verifyUser, rideRoute);
app.use(`${baseURL}/chat`, verifyUser, chatRoute);
app.use(`${baseURL}/admin`, verifyAdmin, adminRoute);

const PORT = process.env.PORT || 5000;

//Create http server
const httpServer = http.createServer(app);

//Initialize socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

//Attach socket event handlers
socketHandler(io);

const server = httpServer.listen(PORT, async () => {
    await connectDB();
    console.log(`Server + Socket.IO running on PORT ${PORT}`);
});