import FrequentRide from "../../models/FrequentRide.js";
import { geocodeAddress } from "../../maps/geocode.js";

const createFrequentRide = async (req, res) => {
    try {
        const { from, to } = req.body;
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
        const frequentRide = await FrequentRide.findOne({
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
        });

        if (frequentRide) {
            return res.status(400).json({ message: "Frequent ride already exists" });
        };

        await FrequentRide.create({
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
        });

        res.status(201).send();
    } catch (err) {
        console.error("Error creating frequent ride:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default createFrequentRide;