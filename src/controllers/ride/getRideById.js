import Ride from "../../models/Ride.js";
import Drive from "../../models/Drive.js";
import UserProfile from "../../models/UserProfile.js";
import getProfileImg from "../../crud/getProfileImg.js";
import DriverStat from "../../models/DriverStat.js";
import DriverRating from "../../models/DriverRating.js";
import Vehicle from "../../models/Vehicle.js";

const getRideById = async (req, res) => {
    try {
        const passengerId = req.user.id;

        if (!passengerId) {
            return res.status(400).json({ message: "User id not found" });
        }
        const { rideId } = req.query;

        if (!rideId) {
            return res.status(404).json({ message: "Ride id not found" });
        }

        const ride = await Ride.findById(rideId).populate({
            path: "drive",
            populate: {
                path: "driver",
                select: "username mobile",
            },
            select: "departureTime driveStatus estimatedTimeMin specialNote from to"
        });

        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }

        const drive = ride.drive;
        if (!drive) {
            return res.status(404).json({ message: "Associated drive not found" });
        }

        const driverProfile = await UserProfile.findOne({ user: drive.driver });
        const profileImg = await getProfileImg(driverProfile.profileImg.publicId, driverProfile.profileImg.format,
            driverProfile.profileImg.isUpdated);
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

        const response = {
            ride: updatedRide,
            driverProfileImg: profileImg,
            driverRating: averageRating,
            userRating: userRating
        };

        res.status(200).json(response);
    }
    catch (err) {
        console.error("Error getting ride by id:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export default getRideById;