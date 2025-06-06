import { PrismaClient } from "@prisma/client"; 


import prisma from "../prismaClient.js";

export const createStore = async (req, res) => {
  const { name, email, address } = req.body;
  try {
    
    if (!name || !email || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    
    const existingStore = await prisma.store.findUnique({
      where: { email },
    });
    if (existingStore) {
      return res.status(400).json({ message: "A store with this email already exists." });
    }

  
    const store = await prisma.store.create({
      data: { name, email, address },
    });
    res.status(201).json(store);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Error creating store" });
  }
};

export const updateStore = async (req, res) => {
  const { id } = req.params;
  const { name, email, address } = req.body;
  try {
      const updatedStore = await prisma.store.update({
          where: { id: parseInt(id) },
          data: { name, email, address },
      });
      res.status(200).json(updatedStore);
  } catch (error) {
      res.status(500).json({ message: 'Error updating store' });
  }
};
export const deleteStore = async (req, res) => {
  const { id } = req.params;
  try {
      await prisma.store.delete({
          where: { id: parseInt(id) },
      });
      res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting store' });
  }
};


export const getAllStores = async (req, res) => {
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

export const listStores = async (req, res) => {
  try {
    const { name, address } = req.query;

    // Fetch all stores with optional filters
    const stores = await prisma.store.findMany({
      where: {
        name: { contains: name || "", mode: "insensitive" },
        address: { contains: address || "", mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        averageRating: true,
      },
    });

    res.status(200).json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Server error while fetching stores." });
  }
};
