import Drive from "../../models/Drive.js";
import Ride from "../../models/Ride.js";

const getRides = async (req, res) => {
    try {
        const { page = 1, limit = 5, driveStatus, driverStatus, month, year } = req.query;
        const skip = (page - 1) * limit;
        let query = {};
        if (driveStatus && driveStatus.trim() !== "") {
            query.driveStatus = driveStatus;
        };
        if (driverStatus && driverStatus.trim() !== "") {
            query.driverStatus = driverStatus;
        };
        if (month && year) {
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);

            if (!isNaN(monthNum) && !isNaN(yearNum)) {
                const monthStart = new Date(yearNum, monthNum - 1, 1, 0, 0, 0);
                const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59);
                query.departureTime = { $gte: monthStart, $lte: monthEnd };
            }
        };

        // Total number of drives for pagination
        const totalDrives = await Drive.countDocuments(query);

        const drives = await Drive.find(query)
            .populate("driver", "username")
            .populate({
                path: "vehicleDetails",
                select: "vehicleDetails -_id",
                transform: doc => doc?.vehicleDetails,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // For each drive, get the ride requests and passenger details
        const rideDetails = await Promise.all(
            drives.map(async (drive) => {
                // Get all rides that reference this drive
                const rides = await Ride.find({ drive: drive._id })
                    .populate("passenger", "username");
                // For each ride, fetch passenger and profile manually
                const rideRequests = await Promise.all(
                    rides.map(async (ride) => {
                        return {
                            passenger: ride.passenger,
                            driverStatus: ride.driverStatus,
                            seats: ride.seats
                        };
                    })
                );

                return {
                    drive: drive,
                    rideRequests: rideRequests.filter(r => r !== null)
                }
            })
        );

        const totalPages = Math.ceil(totalDrives / limit);
        const response = {
            page,
            limit,
            totalItems: totalPages,
            totalPages,
            data: rideDetails
        };
        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching rides for admin:", err);
    }
}
export default getRides;