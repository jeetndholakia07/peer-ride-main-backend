const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("admin_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error logging out admin:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default logoutAdmin;