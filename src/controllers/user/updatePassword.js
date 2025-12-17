import User from "../../models/User.js";
import bcrypt from "bcrypt";

const updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(404).json({ message: "Please enter password", success: false });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User id not found", success: false });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).send();
    }
    catch (err) {
        console.error("Error updating password:", err);
        res.status(500).send();
    }
}
export default updatePassword;