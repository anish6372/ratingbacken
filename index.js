import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import prisma from "./prismaClient.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import { protect, adminOnly, storeOwnerOnly } from "./middleware/authMiddleware.js"; // Add middleware

dotenv.config();

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from localhost:5173
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true // Allow cookies and credentials
}));
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", protect, adminOnly, adminRoutes); // Protect admin routes
app.use("/api/stores", protect, storeOwnerOnly, storeRoutes); // Protect store owner routes
app.use("/api/ratings", protect, ratingRoutes); // Protect ratings routes

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});

// Test Database Connection
async function testDBConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Successfully connected to MySQL database!");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}
testDBConnection();

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
