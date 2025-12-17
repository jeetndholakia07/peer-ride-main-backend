import { findRidesByLocation } from "../../crud/findRidesByLocation.js";
import getProfileImg from "../../crud/getProfileImg.js";
import UserProfile from "../../models/UserProfile.js";
import DriverStat from "../../models/DriverStat.js";

const getRidesOnLocation = async (req, res) => {
    try {
        const { from, to, seats, date, page = 1, limit = 5 } = req.body;

        if (!from || !to || !seats || !date) {
            return res.status(400).json({ message: "Please enter from & to locations, coordinates, seats and date" });
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

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch rides
        const rides = await findRidesByLocation({
            fromCoords,
            toCoords,
            fromAddress: from.address,
            toAddress: to.address,
            seats,
            startOfDay,
            endOfDay,
            page,
            limit
        });

        // Populate driver details for each ride
        const driveDetails = await Promise.all(
            rides.map(async (drive) => {
                const userProfile = await UserProfile.findOne({ user: drive.driver });
                const profileImg = await getProfileImg(
                    userProfile?.profileImg?.publicId,
                    userProfile?.profileImg?.format,
                    userProfile?.profileImg?.isUpdated
                );
                const driverStat = await DriverStat.findOne({ driver: drive.driver });
                const averageRating = driverStat?.averageRating ?? null;
                const updatedDrive = {
                    ...drive,
                    from: drive.from?.address,
                    to: drive.to?.address
                };

                return {
                    driveDetails: {
                        drive: {
                            ...updatedDrive
                        },
                        driverProfileImg: profileImg,
                        driverRating: averageRating
                    }
                };
            })
        );

        res.status(200).json({
            page,
            limit,
            totalItems: rides.length,
            totalPages: Math.ceil(rides.length / limit),
            data: driveDetails
        });

    } catch (err) {
        console.error("Error getting rides based on location:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getRidesOnLocation;
