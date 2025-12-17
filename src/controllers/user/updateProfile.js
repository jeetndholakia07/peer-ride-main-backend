import UserProfile from "../../models/UserProfile.js";
import User from "../../models/User.js";
import deleteImage from "../../crud/deleteImage.js";
import uploadImage from "../../crud/uploadImage.js";
import fs from "fs";

const updateProfile = async (req, res) => {
    let filePath;
    let result;
    try {
        const { fullName, username, mobile, collegeName, role, isCollege } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        if (fullName === null || isCollege === null) {
            return res.status(404).json({ message: "Please provide full name and college status", success: false });
        }
        if (!username || !mobile) {
            return res.status(404).json({ message: "Username and mobile not found", success: false });
        }
        if (isCollege) {
            if (!collegeName) {
                return res.status(404).json({ message: "College Name not found", success: false });
            }
            if (!req.file || !req.file.path) {
                return res.status(400).json({ message: "College ID image is required.", success: false });
            }
        }

        //Find user and profile
        const user = await User.findById(userId);
        const userProfile = await UserProfile.findOne({ user: userId });
        if (!user || !userProfile) {
            return res.status(400).json({ message: "User or user profile not found", success: false });
        }

        //Update necessary fields
        userProfile.fullName = fullName;
        user.username = username
        user.mobile = mobile;
        user.role = role;

        //Check for optional fields
        if (isCollege) {
            userProfile.collegeName = collegeName;
            filePath = req.file.path;
            //Upload the image to cloudinary
            result = await uploadImage(filePath, "collegeIDProof", username);
            userProfile.collegeIDProof = {
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height
            }
        }

        //Save changes
        await user.save();
        await userProfile.save();
        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating profile details:", err);
        res.status(500).send();
    }
    finally {
        if (filePath) {
            await fs.promises.unlink(filePath)
                .catch((err) => console.error("Error deleting upload:", err));
        }
    }
}
export default updateProfile;