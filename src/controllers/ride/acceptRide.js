import Ride from "../../models/Ride.js";
import User from "../../models/User.js";
import Drive from "../../models/Drive.js";
import createNotification from "../../crud/createNotification.js";

/* Accept ride request by driver */
const acceptRide = async (req, res) => {
    try {
        const { passengerId, driveId } = req.body;
        if (!passengerId || !driveId) {
            return res.status(404).json({ message: "Please enter driver id and passenger id." });
        }
        const ride = await Ride.findOne({ drive: driveId, passenger: passengerId });
        const drive = await Drive.findById(driveId);
        if (!ride || !drive) {
            return res.status(404).json({ message: "Drive or ride not found" });
        }

        //Save changes
        ride.driverStatus = "accepted";
        ride.acceptedAt = new Date();
        await ride.save();

        //Notify passenger of accepted ride
        const driver = await User.findById(drive.driver);
        await createNotification("rideAccepted", passengerId, {
            driverName: driver.username,
            from: ride.from.address,
            to: ride.to.address,
            linkId: ride._id
        });

        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating drive status:", err);
        res.status(500).send();
    }
}
export default acceptRide;