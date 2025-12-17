import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullName: {
        type: String
    },
    isCollege: {
        type: Boolean,
        default: false
    },
    collegeName: {
        type: String,
        required: function () {
            return this.isCollege;
        }
    },
    collegeIDProof: {
        type: {
            publicId: { type: String },
            format: { type: String },
            width: { type: Number },
            height: { type: Number }
        },
        required: function () {
            return this.isCollege;
        }
    },
    profileImg: {
        publicId: { type: String, required: true },
        format: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        isUpdated: { type: Boolean, default: false },
    }
}, { timestamps: true });

const Profile = mongoose.model("UserProfile", UserProfileSchema);

export default Profile;