import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";


export const protect = async (req, res, next) => {
  let token;

  console.log("Authorization Header:", req.headers.authorization); 

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("Token Received:", token); 

      if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing after Bearer" });
      }

    
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      console.log("Authenticated User:", req.user); 
      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed or invalid" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token or wrong format" });
  }
};



export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};


export const storeOwnerOnly = (req, res, next) => {
  if (req.user?.role !== "STORE_OWNER") {
    return res.status(403).json({ message: "Access denied, store owner only" });
  }
  next();
};


export const storeOwnerOrUser = (req, res, next) => {
  if (req.user.role === "STORE_OWNER" || req.user.role === "USER") {
    return next(); 
  }
  res.status(403).json({ message: "Access denied, store owner or user only" });
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: `Access denied, only for roles: ${roles.join(", ")}` });
    }
    next();
  };
};

export const allowUserAndStoreOwner = (req, res, next) => {
  if (req.user?.role === "USER" || req.user?.role === "STORE_OWNER" || req.user?.role === "ADMIN") {
    return next(); // Allow access for users, store owners, and admins
  }
  res.status(403).json({ message: "Access denied, user or store owner only" });
};
