import express from "express";
import { addUser, addStore, dashboard, listUsers, listStores } from "../Controllers/admincontroller.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/store", protect, adminOnly, listStores);


router.get("/dashboard", protect, adminOnly, dashboard);


router.get("/users", protect, adminOnly, listUsers);


router.post("/stores", protect, adminOnly, addStore);


router.post("/user", protect, adminOnly, addUser);

export default router;
