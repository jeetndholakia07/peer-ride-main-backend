import Drive from "../../models/Drive.js";
import Ride from "../../models/Ride.js";
import User from "../../models/User.js";

const dashboard = async (req, res) => {
    try {
        const completedRides = await Drive.countDocuments({ driveStatus: "completed" });
        const cancelledRides = await Drive.countDocuments({ driveStatus: "cancelled" });
        const liveRides = await Drive.countDocuments({ driveStatus: "pending" });
        const totalRides = await Ride.countDocuments();
        const totalUsers = await User.countDocuments();
        const response = {
            completedRides,
            cancelledRides,
            liveRides,
            totalRides,
            totalUsers
        };
        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching dashboard details:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default dashboard;