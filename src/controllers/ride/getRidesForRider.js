import Ride from "../../models/Ride.js";
import Drive from "../../models/Drive.js";
import UserProfile from "../../models/UserProfile.js";
import getProfileImg from "../../crud/getProfileImg.js";
import DriverStat from "../../models/DriverStat.js";
import DriverRating from "../../models/DriverRating.js";
import Vehicle from "../../models/Vehicle.js";

const getRidesForRider = async (req, res) => {
    try {
        const { page = 1, limit = 5, driverStatus, driveStatus, month, year } = req.query;
        const skip = (page - 1) * limit;
        const passengerId = req.user.id;

        if (!passengerId) {
            return res.status(400).json({ message: "Passenger id not found" });
        }

        // Base ride query (rider-related filters)
        let rideQuery = { passenger: passengerId };
        if (driverStatus && driverStatus.trim() !== "") {
            rideQuery.driverStatus = driverStatus;
        }

        // Drive-level filters (driveStatus, month, year)
        let driveFilters = {};

        if (driveStatus && driveStatus.trim() !== "") {
            driveFilters.driveStatus = driveStatus;
        }

        if (month && year) {
            const monthNum = parseInt(month, 10);
            const yearNum = parseInt(year, 10);

            if (!isNaN(monthNum) && !isNaN(yearNum)) {
                const monthStart = new Date(yearNum, monthNum - 1, 1, 0, 0, 0);
                const monthEnd = new Date(yearNum, monthNum, 0, 23, 59, 59);
                driveFilters.departureTime = { $gte: monthStart, $lte: monthEnd };
            }
        }

        // If we have any drive-level filters, find matching drives
        if (Object.keys(driveFilters).length > 0) {
            const drives = await Drive.find(driveFilters).select("_id");
            const driveIds = drives.map((d) => d._id);

            // If no drives match, return empty result early
            if (driveIds.length === 0) {
                return res.status(200).json({
                    page,
                    limit,
                    totalItems: 0,
                    totalPages: 0,
                    data: [],
                });
            }

            // Link filtered drives to rides
            rideQuery.drive = { $in: driveIds };
        }

        const totalRides = await Ride.countDocuments(rideQuery);

        const rides = await Ride.find(rideQuery)
            .populate({
                path: "drive",
                populate: {
                    path: "driver",
                    select: "username mobile",
                },
                select: "departureTime driveStatus estimatedTimeMin specialNote from to"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const rideDetails = await Promise.all(
            rides.map(async (ride) => {
                const drive = ride.drive;
                if (!drive) return null;

                const driverProfile = await UserProfile.findOne({ user: drive.driver });
                let profileImg = null;

                if (driverProfile?.profileImg) {
                    profileImg = await getProfileImg(
                        driverProfile.profileImg.publicId,
                        driverProfile.profileImg.format,
                        driverProfile.profileImg.isUpdated
                    );
                }

                const driverStat = await DriverStat.findOne({ driver: drive.driver });
                const userRating = await DriverRating.findOne({
                    driver: drive.driver,
                    user: passengerId,
                    drive: drive._id
                }).select("rating review");
                const averageRating = driverStat?.averageRating ?? null;
                const vehicle = await Vehicle.findOne({ driver: drive.driver });

                const { from: driveFromObj, to: driveToObj, ...driveRest } = drive.toObject();
                const updatedDrive = {
                    ...driveRest,
                    driveFrom: driveFromObj?.address,
                    driveTo: driveToObj?.address,
                    vehicleDetails: vehicle.vehicleDetails
                };
                const { from: rideFromObj, to: rideToObj, ...rideRest } = ride.toObject();
                const updatedRide = {
                    ...rideRest,
                    rideFrom: rideFromObj?.address,
                    rideTo: rideToObj?.address,
                    drive: updatedDrive
                };

                return {
                    ride: updatedRide,
                    driverProfileImg: profileImg,
                    driverRating: averageRating,
                    userRating: userRating
                };
            })
        );

        const totalPages = Math.ceil(totalRides / limit);

        return res.status(200).json({
            page,
            limit,
            totalItems: totalRides,
            totalPages,
            data: rideDetails.filter(Boolean),
        });
    } catch (err) {
        console.error("Error getting rides for rider:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export default getRidesForRider;
