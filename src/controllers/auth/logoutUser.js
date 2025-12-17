const logoutUser = async (req, res) => {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error logging out user:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default logoutUser;