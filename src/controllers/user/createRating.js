import Rating from "../../models/Rating.js";

const createRating = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        if (!rating || review === null) {
            return res.status(404).json({ message: "Please provide rating and review" });
        }
        await Rating.create({
            user: userId,
            rating: rating,
            review: review
        });
        res.status(201).send();
    }
    catch (err) {
        console.error("Error creating rating:", err);
        res.status(500).send();
    }
}
export default createRating;