import Rating from "../../models/Rating.js";

const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rating, review } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        const userRating = await Rating.findOne({ user: userId });
        if (!userRating) {
            return res.status(404).json({ message: "User rating not found" });
        }
        //Save changes
        userRating.rating = rating;
        userRating.review = review;
        await userRating.save();
        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating review:", err);
        res.status(500).send();
    }
}
export default updateReview;