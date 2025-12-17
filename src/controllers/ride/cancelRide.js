import Ride from "../../models/Ride.js";
import User from "../../models/User.js";
import Drive from "../../models/Drive.js";
import createNotification from "../../crud/createNotification.js";

/* Cancel ride by driver */
const cancelRide = async (req, res) => {
    try {
        const { driveId } = req.body;
        if (!driveId) {
            return res.status(404).json({ message: "Please enter drive id" });
        }
        // Find the drive
        const drive = await Drive.findById(driveId);
        if (!drive) {
            return res.status(404).json({ message: "Drive not found." });
        }

        // Get all rides associated with the drive
        const rides = await Ride.find({ drive: driveId });
        if (rides.length === 0) {
            return res.status(404).json({ message: "No rides found for this drive." });
        }

        //Save changes
        drive.driveStatus = "cancelled";
        drive.cancelledAt = new Date();
        await drive.save();

        // Get driver info
        const driver = await User.findById(drive.driver);

        // Notify all passengers about ride cancelled
        await Promise.all(
            rides.map((ride) =>
                createNotification("driveCancelled", ride.passenger, {
                    driverName: driver.username,
                    from: ride.from.address,
                    to: ride.to.address,
                    linkId: ride._id
                })
            )
        );

        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating ride status:", err);
        res.status(500).send();
    }
}
export default cancelRide;