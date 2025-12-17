import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email",
                success: false
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid password",
                success: false
            });
        };

        const token = jwt.sign({ username: user.username, id: user.id, role: user.role }, process.env.JWT_SECRET);

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        res.status(200).json({
            success: true,
            userId: user.id,
            role: user.role,
            username: user.username
        });
    }
    catch (err) {
        console.error("Error logging user:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
export default login;