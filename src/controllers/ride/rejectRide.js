import Ride from "../../models/Ride.js";
import User from "../../models/User.js";
import Drive from "../../models/Drive.js";
import createNotification from "../../crud/createNotification.js";

/* Reject ride request by driver */
const rejectRide = async (req, res) => {
    try {
        const { passengerId, driveId } = req.body;
        if (!passengerId || !driveId) {
            return res.status(404).json({ message: "Please enter passenger id and drive id" });
        }
        const driverId = req.user.id;
        if (!passengerId) {
            return res.status(400).json({ message: "Passenger id not found" });
        }
        const ride = await Ride.findOne({ drive: driveId, passenger: passengerId });
        const drive = await Drive.findById(driveId);

        if (!ride || !drive) {
            return res.status(404).json({ message: "Drive or ride not found" });
        }

        //Save changes
        ride.driverStatus = "rejected";
        ride.rejectedAt = new Date();
        await ride.save();

        const driver = await User.findById(driverId);

        //Notify passenger of rejected ride
        await createNotification("rideRejected", passengerId, {
            driverName: driver.username,
            from: ride.from.address,
            to: ride.to.address
        });

        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating drive status:", err);
        res.status(500).send();
    }
}
export default rejectRide;