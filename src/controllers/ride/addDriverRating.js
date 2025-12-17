import driverRating from "../../models/DriverRating.js";
import User from "../../models/User.js";
import DriverStat from "../../models/DriverStat.js";
import createNotification from "../../crud/createNotification.js";

const addDriverRating = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({ message: "User id not found" });
        }
        const { driveId, driverId, rating, review } = req.body;
        if (!driverId || !driveId || !rating || review === null) {
            return res.status(404).json({ message: "Please enter driver id, drive id and rating" });
        }
        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(400).json({ message: "Driver not found" });
        }
        const previousRating = await driverRating.findOne({ driver: driverId, user: userId, drive: driveId });
        if (previousRating) {
            return res.status(400).json({ message: "Rating already exists" });
        }
        await driverRating.create({
            driver: driverId,
            user: userId,
            drive: driveId,
            rating: rating,
            review: review
        });

        // Recalculate the driver’s new average rating
        const result = await driverRating.aggregate([
            {
                $match: {
                    $expr: { $eq: ["$driver", { $toObjectId: driverId }] }
                }
            },
            { $group: { _id: "$driver", averageRating: { $avg: "$rating" } } }
        ]);
        const averageRating = result.length > 0 ? Number(result[0].averageRating.toFixed(1)) : Number(rating.toFixed(1));
        await DriverStat.findOneAndUpdate(
            { driver: driverId },
            { averageRating },
            { upsert: true, new: true } // Create if not exists
        );

        const passenger = await User.findById(userId).select("username");

        //Notify driver about new rating
        await createNotification("driverRating", driverId, {
            passengerName: passenger.username,
            rating: rating,
            linkId: driveId
        });

        res.status(201).send();
    }
    catch (err) {
        console.error("Error adding rating for driver:", err);
        res.status(500).send();
    }
}
export default addDriverRating;