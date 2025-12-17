import User from "../../models/User.js";
import fs from "fs";
import uploadImage from "../../crud/uploadImage.js";

const updateCollegeID = async (req, res) => {
    let filePath;
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }
        filePath = req.file.path;
        if (!filePath) {
            return res.status(400).json({ message: "No file path provided" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const result = await uploadImage(filePath, "collegeIDProof", user.username);
        user.collegeIDProof = {
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        };

        await user.save();
        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating collegeID:", err);
        res.status(500).send();
    }
    finally {
        if (filePath) {
            await fs.promises.unlink(filePath)
                .catch((err) => console.error("Error deleting upload:", err));
        }
    }
}
export default updateCollegeID;