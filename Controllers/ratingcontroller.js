import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient();  


export const submitRating = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { storeId, rating } = req.body;

   
    if (!storeId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid store or rating (1-5)." });
    }


    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

   
    const existingRating = await prisma.rating.findFirst({
      where: { storeId, userId },
    });

    if (existingRating) {
     
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
    
      await prisma.rating.create({
        data: { userId, storeId, rating },
      });
    }

   
    const allRatings = await prisma.rating.findMany({
      where: { storeId },
    });
    const avgRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;

   
    await prisma.store.update({
      where: { id: storeId },
      data: { averageRating: parseFloat(avgRating.toFixed(2)) },  
    });

    res.status(200).json({ message: "Rating submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
