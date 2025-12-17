import Vehicle from "../../models/Vehicle.js";

const saveVehicle = async (req, res) => {
    try {
        const driverId = req.user.id;
        if (!driverId) {
            return res.status(400).json({ message: "Driver id not found" });
        };
        const { vehicleName, vehicleType, vehicleNumber, fuelType, isAc } = req.body;
        if (!vehicleName || !vehicleType || !vehicleNumber) {
            return res.status(400).json({ message: "Please provide vehicle details" });
        }
        await Vehicle.findOneAndUpdate(
            { driver: driverId }, // filter
            {
                $set: {
                    vehicleDetails: {
                        vehicleType,
                        vehicleName,
                        vehicleNumber,
                        fuelType,
                        isAc
                    },
                    isSaved: true,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );
        res.status(200).send();
    } catch (err) {
        console.error("Error saving vehicle details:", err);
        res.status(500).send();
    }
}
export default saveVehicle;