import UserProfile from "../../models/UserProfile.js";
import getProfileImg from "../../crud/getProfileImg.js";
import User from "../../models/User.js";
import getCollegeID from "../../crud/getCollegeID.js";

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({ message: "User id not found" });
        }
        const userProfile = await UserProfile.findOne({ user: userId }).populate("user");
        const user = await User.findById(userId);
        if (!user || !userProfile) {
            return res.status(400).json({ message: "User or user profile not found", success: false });
        }
        const userData = {
            username: user.username,
            mobile: user.mobile,
            email: user.email,
            role: user.role
        };
        let response = { fullName: userProfile.fullName, email: userProfile.email, ...userData };
        const profileImg = await getProfileImg(userProfile.profileImg.publicId, userProfile.profileImg.format, userProfile.profileImg.isUpdated);
        response = {
            ...response,
            ...(userProfile.isCollege && getCollegeID(userProfile.collegeIDProof.publicId, userProfile.collegeIDProof.format)),
            profileImg: profileImg
        };
        res.status(200).json(response);
    }
    catch (err) {
        console.error("Error getting user profile:", err);
        return res.status(500).send();
    }
}
export default getUserProfile;