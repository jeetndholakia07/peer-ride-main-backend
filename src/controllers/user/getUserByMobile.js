import User from "../../models/User.js";

const getUserByMobile = async (req, res) => {
    try {
        const { mobile, email } = req.body;
        const userId = req.user.id;
        if (!mobile || !email) {
            return res.status(404).json({ message: "Please provide mobile number or email id", success: false });
        }
        const user = await User.findOne({ mobile: mobile });
        const matchUser = await User.findById(userId);
        if (!matchUser) {
            return res.status(400).json({ message: "Invalid mobile number", success: false });
        }
        if (!user) {
            return res.status(400).json({ message: "Invalid mobile number", success: false });
        }
        if (!user._id.equals(matchUser._id)) {
            return res.status(401).json({ message: "User doesn't match", success: false });
        }
        res.status(200).send();
    }
    catch (err) {
        console.error("Error getting user by mobile:", err);
        res.status(500).send();
    }
}
export default getUserByMobile;