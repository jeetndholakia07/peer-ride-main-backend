import mongoose from "mongoose";
import Rating from "../../models/Rating.js";
import UserProfile from "../../models/UserProfile.js";
import getProfileImg from "../../crud/getProfileImg.js";

const getRatings = async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        const userId = req.user?.id

        const ratings = await Rating.find()
            .populate("user", "username role _id")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalRatings = await Rating.countDocuments();

        const formattedRatings = await Promise.all(
            ratings.map(async (ratingDoc) => {
                const profile = await UserProfile.findOne({ user: ratingDoc.user._id });
                const profileImg = profile
                    ? await getProfileImg(
                        profile.profileImg.publicId,
                        profile.profileImg.format,
                        profile.profileImg.isUpdated
                    )
                    : null;

                const isUserRating =
                    userId &&
                    ratingDoc.user._id.toString() === userId.toString();

                return {
                    rating: ratingDoc.rating,
                    review: ratingDoc.review,
                    updatedAt: ratingDoc.updatedAt,
                    isUserRating,
                    user: {
                        userId: ratingDoc.user._id,
                        username: ratingDoc.user.username,
                        role: ratingDoc.user.role,
                        profileImg,
                    },
                };
            })
        );

        const sortedRatings = userId
            ? formattedRatings.sort((a, b) => (a.isUserRating === b.isUserRating ? 0 : a.isUserRating ? -1 : 1))
            : formattedRatings;

        const totalPages = Math.ceil(totalRatings / limit);

        res.status(200).json({
            page: Number(page),
            limit: Number(limit),
            totalItems: totalRatings,
            totalPages,
            data: sortedRatings,
        });
    } catch (err) {
        console.error("Error getting ratings:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export default getRatings;
