import jwt from "jsonwebtoken";
import User from "../models/User.js";

const optionalAuth = async (req, res, next) => {
    try {
        let token = req.header("Authorization");

        if (token) {
            token = token.replace("Bearer ", "").trim();

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.id) {
                return res.status(401).json({ message: "Invalid token payload" });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = {
                id: user.id,
                role: user.role,
                username: user.username
            };
        }

        next();
    } catch (err) {
        console.error("Error verifying user:", err.message);
        next();
    }
};

export default optionalAuth;
