import Drive from "../../models/Drive.js";
import { geocodeAddress } from "../../maps/geocode.js";
import { getDistanceBetweenPoints } from "../../maps/osrm.js";
import Vehicle from "../../models/Vehicle.js";

const createDrive = async (req, res) => {
    try {
        const { from, to, departureTime, vehicleName, vehicleType, vehicleNumber, seats, comments, fuelType, isAc, price, durationMin, distanceKm } = req.body;
        if (!from || !to || !departureTime || !vehicleName || !vehicleType || !vehicleNumber || !seats || comments === null || !price
            || !fuelType || isAc === null || !durationMin || !distanceKm) {
            return res.status(404).json({ message: "Please enter all fields" });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }

        let fromCoords, toCoords;
        if (from.lat && from.lng) {
            fromCoords = { lat: from.lat, lng: from.lng };
        } else {
            fromCoords = await geocodeAddress(from);
        }

        if (to.lat && to.lng) {
            toCoords = { lat: to.lat, lng: to.lng };
        } else {
            toCoords = await geocodeAddress(to);
        }

        if (!fromCoords || !toCoords) {
            return res.status(400).json({ message: "Unable to fetch coordinates" });
        }

        const vehicle = await Vehicle.create({
            driver: userId,
            vehicleDetails: {
                vehicleType,
                vehicleName,
                vehicleNumber,
                fuelType,
                isAc
            }
        });

        await Drive.create({
            driver: userId,
            from: {
                address: from.address,
                location: {
                    type: "Point",
                    coordinates: [fromCoords.lng, fromCoords.lat] // [longitude, latitude]
                }
            },
            to: {
                address: to.address,
                location: {
                    type: "Point",
                    coordinates: [toCoords.lng, toCoords.lat]
                }
            },
            departureTime: departureTime,
            seatsAvailable: seats,
            vehicleDetails: vehicle._id,
            specialNote: comments,
            pricePerPerson: price,
            distanceKm: distanceKm,
            estimatedTimeMin: durationMin
        });
        res.status(201).json();
    }
    catch (err) {
        console.error("Error creating a drive:", err);
        res.status(500).send();
    }
}
export default createDrive;