import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Please enter username and password" });
        }
        const admin = await Admin.findOne({ username: username });
        if (!admin) {
            return res.status(401).json({ message: "User doesn't exist" });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password entered" });
        }
        const token = jwt.sign({ username: admin.username, id: admin.id }, process.env.JWT_SECRET);
        res.cookie("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.status(200).json({
            success: true,
            id: admin.id,
            username: admin.username
        });
    } catch (err) {
        console.error("Error logging admin:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default loginAdmin;