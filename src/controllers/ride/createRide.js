import Ride from "../../models/Ride.js";
import User from "../../models/User.js";
import Drive from "../../models/Drive.js";
import createNotification from "../../crud/createNotification.js";
import { geocodeAddress } from "../../maps/geocode.js";

const createRide = async (req, res) => {
    try {
        const passengerId = req.user.id;
        if (!passengerId) {
            return res.status(400).json({ message: "Passenger id not found" });
        }
        const { from, to, driveId, seats, price } = req.body;
        if (!driveId || !seats || !from || !to || price === null) {
            return res.status(404).json({ message: "Please enter drive id and seats" });
        }

        //Check for seats availability
        const drive = await Drive.findById(driveId);
        if (!drive) {
            return res.status(404).json({ message: "Drive not found" });
        }

        if (drive.seatsAvailable === 0) {
            return res.status(400).json({ message: "No seats available" });
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

        //Create Ride Request
        await Ride.create({
            drive: driveId,
            passenger: passengerId,
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
            seats: seats,
            amountRequested: price,
            driverStatus: "accepted"
        });

        //Update drive seats
        drive.seatsAvailable = drive.seatsAvailable - seats;
        await drive.save();

        //Get the driverId to notify
        const driverId = await User.findById(drive.driver);
        const passenger = await User.findById(passengerId);

        //Notify driver about ride request
        await createNotification("rideRequested", driverId, {
            passengerName: passenger.username,
            from: from.address,
            to: to.address,
            linkId: drive._id
        });

        res.status(201).json();
    }
    catch (err) {
        console.error("Error creating new ride:", err);
        res.status(500).send();
    }
}
export default createRide;