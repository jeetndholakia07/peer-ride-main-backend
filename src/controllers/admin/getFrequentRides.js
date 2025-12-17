import FrequentRide from "../../models/FrequentRide.js";

const getFrequentRides = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        const frequentRides = await FrequentRide.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalRides = await FrequentRide.countDocuments();
        const totalPages = Math.ceil(totalRides / limit);
        const response = {
            page,
            limit,
            totalItems: totalRides,
            totalPages,
            data: frequentRides
        };
        res.status(200).json(response)
    } catch (err) {
        console.error("Error getting frequent rides:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default getFrequentRides;