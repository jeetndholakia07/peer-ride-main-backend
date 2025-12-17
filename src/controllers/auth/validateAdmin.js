import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";

const validateAuth = async (req, res) => {
    try {
        const token = req.cookies?.admin_token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ message: "Admin not found" });
        res.status(200).json({
            id: admin.id,
            username: admin.username,
        });
    }
    catch (err) {
        console.error("Error validating admin:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}
export default validateAuth;