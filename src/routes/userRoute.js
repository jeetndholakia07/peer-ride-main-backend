import express from "express";
import getUserProfile from "../controllers/user/getUserProfile.js";
import getNotifications from "../controllers/user/getNotifications.js";
import getProfileImage from "../controllers/user/getProfileImg.js";
import getUserByMobile from "../controllers/user/getUserByMobile.js";
import createRating from "../controllers/user/createRating.js";
import updateProfile from "../controllers/user/updateProfile.js";
import updateProfileImg from "../controllers/user/updateProfileImg.js";
import updatePassword from "../controllers/user/updatePassword.js";
import markNotificationRead from "../controllers/user/markNotificationRead.js";
import updateCollegeID from "../controllers/user/updateCollegeID.js";
import resetProfileImg from "../controllers/user/resetProfileImg.js";
import markAllNotificationsAsRead from "../controllers/user/markAllNotificationRead.js";
import getNotificationCount from "../controllers/user/getNotificationCount.js";
import updateReview from "../controllers/user/updateReview.js";
import multer from "multer";

const userRoute = express.Router();

userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));
const upload = multer({ dest: "uploads/" });

userRoute.get("/userProfile", getUserProfile);
userRoute.get("/profileImage", getProfileImage);
userRoute.get("/notifications", getNotifications);
userRoute.post("/verifyUser", getUserByMobile);
userRoute.post("/rating", createRating);
userRoute.put("/userProfile", upload.single("collegeID"), updateProfile);
userRoute.put("/profileImage", upload.single("profileImg"), updateProfileImg);
userRoute.put("/editPassword", updatePassword);
userRoute.put("/editCollegeID", upload.single("collegeID"), updateCollegeID);
userRoute.put("/markNotificationRead", markNotificationRead);
userRoute.put("/resetProfileImg", resetProfileImg);
userRoute.put("/markAllNotificationRead", markAllNotificationsAsRead);
userRoute.get("/notificationCount", getNotificationCount);
userRoute.put("/editReview", updateReview);

export default userRoute;