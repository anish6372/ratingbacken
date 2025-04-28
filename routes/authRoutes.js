import express from "express";
import { register, login, updatePassword } from "../Controllers/authcontroller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);


router.put("/update-password", protect, authorizeRoles("STORE_OWNER", "USER"), updatePassword);

export default router;
