import UserProfile from "../../models/UserProfile.js";
import deleteImage from "../../crud/deleteImage.js";

const resetProfileImg = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        const userProfile = await UserProfile.findOne({ user: userId });
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }
        //Delete image
        await deleteImage(userProfile.profileImg.publicId);

        //Save changes
        userProfile.profileImg.format = "png";
        userProfile.profileImg.height = 300;
        userProfile.profileImg.width = 300;
        userProfile.profileImg.publicId = process.env.DEFAULT_PROFILE;

        await userProfile.save();
        res.status(200).send();
    }
    catch (err) {
        console.error("Error reseting profile image:", err);
        res.status(500).send();
    }
}
export default resetProfileImg;