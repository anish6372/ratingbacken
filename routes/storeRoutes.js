import express from "express";
import { listStores } from "../Controllers/storecontroller.js";
import { protect, allowUserAndStoreOwner } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/store", protect, allowUserAndStoreOwner, listStores);

export default router;
