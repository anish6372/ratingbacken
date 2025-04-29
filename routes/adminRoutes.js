import express from "express";
import { addUser, addStore, dashboard, listUsers, listStores } from "../Controllers/admincontroller.js";
import { protect, allowUserAndStoreOwner, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// List all stores (accessible to users, store owners, and admins)
router.get("/stores", protect, allowUserAndStoreOwner, listStores);

// Dashboard data (admin only)
router.get("/dashboard", protect, adminOnly, dashboard);

// List all users (admin only)
router.get("/users", protect, adminOnly, listUsers);

// Add a new store (admin only)
router.post("/stores", protect, adminOnly, addStore);

// Add a new user (admin only)
router.post("/user", protect, adminOnly, addUser);

export default router;
