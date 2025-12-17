import Ride from "../../models/Ride.js";

const checkRide = async (req, res) => {
    try {
        const { driveId } = req.body;
        if (!driveId) {
            return res.status(404).json({ message: "Please enter drive id" });
        }
        const passengerId = req.user.id;
        if (!passengerId) {
            return res.status(400).json({ message: "Passenger id not found" });
        }

        //Check if user already has the ride
        const ride = await Ride.findOne({ passenger: passengerId, drive: driveId });
        if (ride) {
            return res.status(400).json({ message: "The given user already has the ride." });
        }
        return res.status(200).send();
    }
    catch (err) {
        console.error("Error creating new ride:", err);
        res.status(500).send();
    }
}
export default checkRide;