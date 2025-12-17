import Drive from "../../models/Drive.js";

const updateDrive = async (req, res) => {
    try {
        const { driveId, from, to, departureTime, vehicleDetails, seatsAvailable, comments, price } = req.body;
        if (!driveId || !from || !to || !departureTime || !vehicleDetails || !seatsAvailable || !comments || !price) {
            return res.status(404).json({ message: "Please enter driveId and all necessary details" });
        }
        const drive = await Drive.findOne({ driver: driveId });
        if (!drive) {
            return res.status(404).json({ message: "No drive found" });
        }
        drive.from = from;
        drive.to = to;
        drive.departureTime = departureTime;
        drive.seatsAvailable = seatsAvailable;
        drive.vehicleDetails = vehicleDetails;
        drive.specialNote = comments;
        drive.pricePerPerson = price;
        await drive.save();
        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating drive:", err);
        res.status(500).send();
    }
}
export default updateDrive;