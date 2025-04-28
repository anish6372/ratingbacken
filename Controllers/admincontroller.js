import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();


export const addUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

  
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


export const addStore = async (req, res) => {
  try {
    const { name, email, address } = req.body; 

   
    if (!name || !email || !address) {
      return res.status(400).json({ message: "Missing required fields (name, email, address)." });
    }

   
    const existingStore = await prisma.store.findUnique({
      where: { email }, 
    });
    if (existingStore) {
      return res.status(400).json({ message: "A store with this email already exists." });
    }

    
    const newStore = await prisma.store.create({
      data: { name, email, address }, 
    });

    res.status(201).json({ message: "Store created successfully.", store: newStore });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Server error while adding store." });
  }
};


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


export const listStores = async (req, res) => {
  try {
    const { name, email,address } = req.query;  
    const userId = req.user.id;  

    
    const stores = await prisma.store.findMany({
      where: {
        name: { contains: name || "", mode: "insensitive" },  
        address: { contains: address || "", mode: "insensitive" }  
      },
      select: {
        id: true,
        name: true,
        email:true,
        address: true,
        averageRating: true,
        ratings: {
          where: { userId: userId },  
          select: { rating: true }
        }
      }
    });

   
    const formattedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      address: store.address,
      overallRating: store.averageRating,  
      userSubmittedRating: store.ratings.length > 0 ? store.ratings[0].rating : null  
    }));

    res.status(200).json(formattedStores);  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};


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


export const logout = (req, res) => {
 
  res.status(200).json({ message: "Admin logged out successfully." });
};
