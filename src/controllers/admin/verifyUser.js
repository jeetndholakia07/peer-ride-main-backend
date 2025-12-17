import User from "../../models/User.js";
import UserProfile from "../../models/UserProfile.js";
import uploadImageWithBadge from "../../crud/uploadImageWithBadge.js";

const verifyUser = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User id is required" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        user.isVerified = true;

        const profile = await UserProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(400).json({ message: "User profile not found" });
        }

        const overwrite = await uploadImageWithBadge(profile.profileImg.publicId, true);

        // Update the profile image with new info
        profile.profileImg = {
            publicId: overwrite.publicId,
            format: overwrite.format,
            width: 300,
            height: 300,
        };
        profile.profileImg.isUpdated = true;

        // Save the profile and user
        await profile.save();
        await user.save();

        res.status(200).send();
    } catch (err) {
        console.error("Error verifying user:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export default verifyUser;
