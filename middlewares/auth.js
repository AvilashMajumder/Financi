import {User} from '../models/User.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = async(req, res, next) => {
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim()
        if(!token){
            return res.status(401).json({ message: "Unauthorized access request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 

        if(!user){
            return res.status(401).json({ message: "Invalid access token" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Forbidden: Account is inactive" });
        }

        req.user = user 
        next() 
        }
        catch(error){
            return res.status(401).json({ message: "Authentication failed, invalid token" });
        }
};

// Add an admin-only guard. Use after verifyJWT.
export const requireAdmin = (req, res, next) => {
        if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins access required" });
        }
        next();
};

// Allow analyst and admin only
export const requireAnalystOrAdmin = (req, res, next) => {
        if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
        }
        if (!["analyst", "admin"].includes(req.user?.role)){
        return res.status(403).json({ message: "Forbidden: Analyst or Admin access required" });
        }
        next();
};

