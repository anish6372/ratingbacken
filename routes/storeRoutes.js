import express from "express";
import { listStores } from "../Controllers/storecontroller.js";
import { protect, allowUserAndStoreOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// List all stores (accessible to normal users and store owners)
router.get("/", protect, allowUserAndStoreOwner, listStores);

export default router;
