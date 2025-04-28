import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Add New User (Normal/Admin/Store Owner)
export const addUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Validation
    if (!["USER", "ADMIN", "OWNER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be 20-60 characters." });
    }
    if (!address || address.length > 400) {
      return res.status(400).json({ message: "Address must be max 400 characters." });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be 8-16 chars, with 1 uppercase & 1 special char." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashedPassword,
        role
      }
    });

    res.status(201).json({ message: "User created successfully.", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Add New Store
export const addStore = async (req, res) => {
  try {
    const { name, email, address } = req.body; // Only require name, email, and address

    // Validate required fields
    if (!name || !email || !address) {
      return res.status(400).json({ message: "Missing required fields (name, email, address)." });
    }

    // Check if a store with the same email already exists
    const existingStore = await prisma.store.findUnique({
      where: { email }, // Ensure the email field exists in the schema
    });
    if (existingStore) {
      return res.status(400).json({ message: "A store with this email already exists." });
    }

    // Create the store
    const newStore = await prisma.store.create({
      data: { name, email, address }, // Match the fields in your schema
    });

    res.status(201).json({ message: "Store created successfully.", store: newStore });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Server error while adding store." });
  }
};

// Admin Dashboard Summary
export const dashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.status(200).json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get All Users (with filter)
export const listUsers = async (req, res) => {
  try {
    const { name, email, address, role } = req.query;

    const users = await prisma.user.findMany({
      where: {
        name: { contains: name || "", mode: "insensitive" },
        email: { contains: email || "", mode: "insensitive" },
        address: { contains: address || "", mode: "insensitive" },
        role: role || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true
      }
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get All Stores (with filter)
export const listStores = async (req, res) => {
  try {
    const { name, email,address } = req.query;  // Destructure search query params
    const userId = req.user.id;  // Assuming user info is stored in req.user (e.g., from JWT token)

    // Fetch all stores with optional search and user rating
    const stores = await prisma.store.findMany({
      where: {
        name: { contains: name || "", mode: "insensitive" },  // Case-insensitive search for name
        address: { contains: address || "", mode: "insensitive" }  // Case-insensitive search for address
      },
      select: {
        id: true,
        name: true,
        email:true,
        address: true,
        averageRating: true,
        ratings: {
          where: { userId: userId },  // Filter ratings by the current logged-in user
          select: { rating: true }
        }
      }
    });

    // Format the stores to include user-submitted rating
    const formattedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address,
      overallRating: store.averageRating,  // Show the overall rating of the store
      userSubmittedRating: store.ratings.length > 0 ? store.ratings[0].rating : null  // Show user's rating, if any
    }));

    res.status(200).json(formattedStores);  // Send the formatted stores in response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get All Users (Normal + Admin) with details
export const listAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["USER", "ADMIN"] },
      },
      include: {
        store: {
          select: {
            name: true,
            email: true,
            address: true,
            rating: true
          }
        }
      },
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Admin logout (optional)
export const logout = (req, res) => {
  // Assuming you are handling token-based sessions, log out by clearing the session
  res.status(200).json({ message: "Admin logged out successfully." });
};
