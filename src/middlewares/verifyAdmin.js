import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const VerifyAdmin = async (req, res, next) => {
    const token = req.cookies?.admin_token;

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.id;
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(401).json({ message: "Invalid username or token provided" });
        }
        req.admin = {
            id: admin.id,
        };
        next();
    }
    catch (err) {
        console.error("Error verifying admin:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
export default VerifyAdmin;