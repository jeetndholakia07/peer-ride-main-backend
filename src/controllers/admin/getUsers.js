import User from "../../models/User.js";
import UserProfile from "../../models/UserProfile.js";
import getCollegeID from "../../crud/getCollegeID.js";
import getProfileImg from "../../crud/getProfileImg.js";

const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 5, isVerified, role, search } = req.query;
        const skip = (page - 1) * limit;
        let query = {};
        if (isVerified) {
            query.isVerified = isVerified;
        }
        if (role) {
            query.role = role;
        }
        if (search) {
            query.username = { $regex: new RegExp(search, 'i') };
        }
        const totalUsers = await User.countDocuments(query);
        const users = await User.find(query)
            .select("username role collegeIDProof isVerified")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const formattedRes = await Promise.all(
            users.map(async (user) => {
                const role = user.role;
                let collegeIDProof;
                if (role === "passenger") {
                    const publicId = user.collegeIDProof.publicId;
                    const format = user.collegeIDProof.format;
                    collegeIDProof = await getCollegeID(publicId, format);
                }
                const profile = await UserProfile.findOne({ user: user._id });
                const profileImg = await getProfileImg(profile.profileImg.publicId, profile.profileImg.format, profile.profileImg.isUpdated);
                return {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    isVerified: user.isVerified,
                    ...(role === "passenger") && {
                        collegeIDProof: collegeIDProof
                    },
                    profileImg: profileImg
                }
            })
        );
        const totalPages = Math.ceil(totalUsers / limit);
        const response = {
            page,
            limit,
            totalItems: totalPages,
            totalPages,
            data: formattedRes
        };
        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default getUsers;