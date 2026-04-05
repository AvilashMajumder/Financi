import { Router } from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	getAllUsers,
	getUserById,
	updateUserRole,
	updateUserStatus,
	deleteUser,
	getMe,
	changePassword,
} from "../controllers/User.controller.js";
import { verifyJWT, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/refresh-token", refreshAccessToken);

router.get("/me", verifyJWT, getMe);
router.put("/change-password", verifyJWT, changePassword);

router.get("/", verifyJWT, requireAdmin, getAllUsers);
router.get("/:id", verifyJWT, requireAdmin, getUserById);
router.patch("/:id/role", verifyJWT, requireAdmin, updateUserRole);
router.patch("/:id/status", verifyJWT, requireAdmin, updateUserStatus);
router.delete("/:id", verifyJWT, requireAdmin, deleteUser);

export default router;
