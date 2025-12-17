import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String
    }
}, { timestamps: true });

const Rating = mongoose.model("Rating", RatingSchema);

export default Rating;