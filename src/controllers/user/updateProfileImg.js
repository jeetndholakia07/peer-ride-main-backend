import UserProfile from "../../models/UserProfile.js";
import uploadImage from "../../crud/uploadImage.js";
import User from "../../models/User.js";
import fs from "fs";
import uploadImageWithBadge from "../../crud/uploadImageWithBadge.js";

const updateProfileImg = async (req, res) => {
    let filePath;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }

        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "No file path provided" });
        }

        filePath = req.file.path;

        const userProfile = await UserProfile.findOne({ user: userId });
        const user = await User.findById(userId);

        if (!userProfile || !user) {
            return res.status(404).json({ message: "User/Profile not found" });
        }

        // Upload original profile image
        const uploaded = await uploadImage(filePath, "user_profiles", userId);

        const overwrite = await uploadImageWithBadge(uploaded.public_id, true);

        // Update user profile
        userProfile.profileImg = {
            publicId: overwrite.public_id,
            format: overwrite.format,
            width: 300,
            height: 300,
        };
        userProfile.profileImg.isUpdated = true;
        await userProfile.save();

        res.status(200).json({ message: "Profile image updated successfully" });
    } catch (err) {
        console.error("Error updating profile image:", err);
        res.status(500).send();
    } finally {
        if (filePath) {
            await fs.promises.unlink(filePath).catch((err) =>
                console.error("Error deleting upload:", err)
            );
        }
    }
};

export default updateProfileImg;
