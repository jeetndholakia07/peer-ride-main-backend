import jwt from "jsonwebtoken";
import User from "../models/User.js";

const VerifyUser = async (req, res, next) => {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json({ message: "Invalid username or token provided" });
        }
        req.user = {
            id: user.id,
            role: user.role
        };
        next();
    }
    catch (err) {
        console.error("Error verifying user:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
export default VerifyUser;