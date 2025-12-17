import FrequentRide from "../../models/FrequentRide.js";

const getFrequentRides = async (req, res) => {
    try {
        const frequentRides = await FrequentRide.find().limit(5).sort({ createdAt: -1 });
        res.status(200).json(frequentRides);
    } catch (err) {
        console.error("Error getting frequent rides:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default getFrequentRides;