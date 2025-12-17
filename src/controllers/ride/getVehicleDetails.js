import Vehicle from "../../models/Vehicle.js";

const getVehicleDetails = async (req, res) => {
    try {
        const driverId = req.user.id;
        if (!driverId) {
            return res.status(400).json({ message: "Driver id not found" });
        };
        const vehicle = await Vehicle.findOne({ driver: driverId });
        res.status(200).json(vehicle);
    } catch (err) {
        console.error("Error getting vehicle details:", err);
        res.status(500).send();
    }
}
export default getVehicleDetails;