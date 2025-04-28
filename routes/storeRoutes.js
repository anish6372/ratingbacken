import express from "express";
import { createStore, getAllStores } from "../Controllers/storecontroller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/stores', createStore);

router.get("/", protect, getAllStores);

export default router;
