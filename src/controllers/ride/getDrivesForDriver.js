import Drive from "../../models/Drive.js";
import Ride from "../../models/Ride.js";
import getProfileImg from "../../crud/getProfileImg.js";
import UserProfile from "../../models/UserProfile.js";
import DriverRating from "../../models/DriverRating.js";

const getDrivesForDriver = async (req, res) => {
    try {
        const { page = 1, limit = 5, driveStatus, month, year } = req.query;
        const skip = (page - 1) * limit;
        const driverId = req.user.id;

        if (!driverId) {
            return res.status(400).json({ message: "Driver id not found" });
        }

        //Filtering
        let query = { driver: driverId };
        if (driveStatus && driveStatus.trim() !== "") {
            query.driveStatus = driveStatus;
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

        // Get all drives created by the driver
        const drives = await Drive.find(query)
            .populate({
                path: "vehicleDetails",
                select: "vehicleDetails -_id",
                transform: doc => doc?.vehicleDetails,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // For each drive, get the ride requests and passenger details
        const driveDetails = await Promise.all(
            drives.map(async (drive) => {
                // Get all rides that reference this drive
                const rides = await Ride.find({ drive: drive._id }).populate("passenger", "username mobile collegeName")

                // For each ride, fetch passenger and profile manually
                const rideRequests = await Promise.all(
                    rides.map(async (ride) => {
                        const passengerProfile = await UserProfile.findOne({ user: ride.passenger });
                        const profileImg = await getProfileImg(passengerProfile.profileImg.publicId, passengerProfile.profileImg.format,
                            passengerProfile.profileImg.isUpdated);
                        const userRating = await DriverRating.findOne({ driver: driverId, user: ride.passenger, drive: ride.drive }).select("rating review");
                        return {
                            passenger: ride.passenger,
                            passengerProfileImg: profileImg,
                            requestedAt: ride.requestedAt,
                            rejectedAt: ride.rejectedAt,
                            driverStatus: ride.driverStatus,
                            seats: ride.seats,
                            pickup: ride.from.address,
                            dropoff: ride.to.address,
                            amountRequested: ride.amountRequested,
                            passengerRating: userRating
                        };
                    })
                );

                return {
                    driveDetails: {
                        driveId: drive._id,
                        from: drive.from.address,
                        to: drive.to.address,
                        departureTime: drive.departureTime,
                        vehicleDetails: drive.vehicleDetails,
                        seatsAvailable: drive.seatsAvailable,
                        driveStatus: drive.driveStatus,
                        specialNote: drive.specialNote,
                        pricePerPerson: drive.pricePerPerson
                    },
                    rideRequests: rideRequests.filter(r => r !== null)
                };
            })
        );

        const totalPages = Math.ceil(totalDrives / limit);

        const response = {
            page,
            limit,
            totalItems: totalDrives,
            totalPages,
            data: driveDetails
        };

        res.status(200).json(response);
    } catch (err) {
        console.error("Error getting drives for driver:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getDrivesForDriver;