import User from "../../models/User.js";
import UserProfile from "../../models/UserProfile.js";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
    try {
        const { username, email, mobile, password, role } = req.body;

        if (!username || !email || !mobile || !password || !role) {
            return res.status(400).json({
                message: "Please enter all fields",
                success: false
            });
        };

        //Create hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create the user
        const newUser = await User.create({
            username: username,
            mobile: mobile,
            email: email,
            role: role,
            password: hashedPassword,
            ...(role === "driver" ? {
                isVerified: true
            } : {
                isVerified: false
            })
        });

        //Create User Profile with default profile image
        await UserProfile.create({
            user: newUser.id,
            email: "",
            fullName: "",
            profileImg: {
                ...(newUser.isVerified ? {
                    publicId: process.env.DEFAULT_PROFILE
                } : {
                    publicId: process.env.DEFAULT_VERIFIED_PROFILE
                }),
                format: "png",
                width: 300,
                height: 300
            }
        });

        res.status(201).send();
    }
    catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
export default createUser;