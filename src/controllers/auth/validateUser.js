import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const validateAuth = async (req, res) => {
    try {
        const token = req.cookies?.access_token;
        if (!token) return res.status(401).json({ message: "Not authenticated", success: false });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: "User not found" });
        res.status(200).json({
            userId: user.id,
            username: user.username,
            role: user.role,
        });
    }
    catch (err) {
        console.error("Error validating user:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
export default validateAuth;