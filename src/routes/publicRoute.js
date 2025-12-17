import express from "express";
import getRatings from "../controllers/general/getRatings.js";
import getRidesonLocation from "../controllers/general/getRidesOnLocation.js";
import getFrequentRides from "../controllers/general/getFrequentRides.js";
import getAutoComplete from "../controllers/general/getAutoComplete.js";
import getRidePrice from "../controllers/general/getRidePrice.js";

const publicRouter = express.Router();

publicRouter.get("/ratings", getRatings);
publicRouter.post("/rides", getRidesonLocation);
publicRouter.get("/frequent-rides", getFrequentRides);
publicRouter.get("/auto-complete", getAutoComplete);
publicRouter.post("/ride-price", getRidePrice);

export default publicRouter;