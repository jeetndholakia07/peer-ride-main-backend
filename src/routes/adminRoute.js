import express from "express";
import createFrequentRide from "../controllers/admin/createFrequentRide.js";
import getRides from "../controllers/admin/getRides.js";
import getUsers from "../controllers/admin/getUsers.js";
import verifyUser from "../controllers/admin/verifyUser.js";
import dashboard from "../controllers/admin/dashboard.js";
import getFrequentRides from "../controllers/admin/getFrequentRides.js";

const adminRoute = express.Router();

adminRoute.use(express.urlencoded({ extended: true }));
adminRoute.use(express.json());

adminRoute.post("/frequent-rides", createFrequentRide);
adminRoute.get("/rides", getRides);
adminRoute.get("/dashboard-master", dashboard);
adminRoute.get("/users", getUsers);
adminRoute.get("/frequent-rides", getFrequentRides);
adminRoute.put("/verify-user", verifyUser);

export default adminRoute;