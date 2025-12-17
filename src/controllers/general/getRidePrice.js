import { getDistanceBetweenPoints } from "../../maps/osrm.js";
import axios from "axios";
import { calculateRideCost } from "../../utils/costCalculator.js";

const getRidePrice = async (req, res) => {
    try {
        const { from, to, seats = 1, vehicleType, isAc = false, fuelType = "petrol" } = req.body;

        // Fetch fuel price
        const options = {
            method: "GET",
            url: `https://daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com/v1/fuel-prices/today/india/${to.state}`,
            headers: {
                "x-rapidapi-key": process.env.FUEL_PRICE_KEY,
                "x-rapidapi-host": "daily-petrol-diesel-lpg-cng-fuel-prices-in-india.p.rapidapi.com",
            },
        };
        const response = await axios.request(options);
        const fuelPrices = {
            petrol: response.data.fuel.petrol.retailPrice,
            diesel: response.data.fuel.diesel.retailPrice,
            cng: response.data.fuel.cng.retailPrice,
        };
        const result = await getDistanceBetweenPoints(from, to);
        if (!result) return res.status(400).json({ error: "Unable to calculate distance" });
        const distanceKm = result.distanceMeters / 1000;
        const durationMin = result.durationSeconds / 60;
        const fareData = calculateRideCost({
            distanceKm,
            vehicleType,
            isAc,
            fuelType,
            seats,
            fuelPrices,
            durationMin
        });
        res.status(200).json(fareData);
    } catch (err) {
        console.error("Error getting ride cost:", err);
        res.status(500).json({ error: "Failed to calculate ride price" });
    }
};

export default getRidePrice;
