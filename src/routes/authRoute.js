import express from "express";
import createUser from "../controllers/auth/createUser.js";
import login from "../controllers/auth/loginUser.js";
import loginAdmin from "../controllers/auth/loginAdmin.js";
import validateUser from "../controllers/auth/validateUser.js";
import logoutUser from "../controllers/auth/logoutUser.js";
import logoutAdmin from "../controllers/auth/logoutAdmin.js";
import validateAdmin from "../controllers/auth/validateAdmin.js";

const authRouter = express.Router();
authRouter.use(express.urlencoded({ extended: true }));
authRouter.use(express.json());

authRouter.post("/register-user", createUser);

authRouter.post("/login-user", login);

authRouter.get("/validate-user", validateUser);

authRouter.post("/login-admin", loginAdmin);

authRouter.post("/logout-user", logoutUser);

authRouter.get("/validate-admin", validateAdmin);

authRouter.post("/logout-admin", logoutAdmin);

export default authRouter;