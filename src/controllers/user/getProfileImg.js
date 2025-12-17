import getProfileImg from "../../crud/getProfileImg.js";
import UserProfile from "../../models/UserProfile.js";
import cloudinary from "cloudinary";

const getProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        const profile = await UserProfile.findOne({ user: userId });
        if (!profile) {
            return res.status(401).json({ message: "User not found" });
        }
        const profileImg = await getProfileImg(profile.profileImg.publicId, profile.profileImg.format, profile.profileImg.isUpdated);
        res.status(200).json(profileImg);
    }
    catch (err) {
        console.error("Error fetching profile image:", err);
        res.status(500).send();
    }
}
export default getProfileImage;