import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.length === 0) {
      if (!req.headers.authorization) {
        next();
        return;
      }
    }

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing or improperly formatted.",
      });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing.",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        config.token_secret as string
      ) as CustomJwtPayload;

      req.user = decoded;

      const requestUserId = req.params?.userId;
      const requestVehiclId = req.params?.vehicleId;
      const requestBookingId = req.params?.bookingId;

      const decodedId = decoded.id.toString();
      const decodedRole = decoded.role;
      const requestMethod = req.method;

      const isAdmin = decodedRole === "admin";
      const isOwn = requestUserId === decodedId;

      if (isAdmin) {
        if (roles.includes("admin")) {
          next();
          return;
        }
      }
      // Check User ID
      if (requestUserId) {
        if (isAdmin && roles.includes("admin")) {
          next();
          return;
        }
        if (isOwn && roles.includes("customer")) {
          if (requestMethod !== "DELETE") {
            next();
            return;
          }
        }
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You are not authorized for this specific resource.",
        });
      }
      // Check Vehicle ID:
      if (requestVehiclId) {
        if (isAdmin && roles.includes("admin")) {
          next();
          return;
        }
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only administrators can modify this resource.",
        });
      }
      // Check Booking ID:
      if (requestBookingId) {
        if (isAdmin && roles.includes("admin")) {
          next();
          return;
        }
        if (isOwn && roles.includes("customer")) {
          if (requestMethod !== "DELETE") {
            next();
            return;
          }
        }
        return res.status(403).json({
          success: false,
          message: "Forbidden: Only administrators can modify this resource.",
        });
      }
      // Check Role:
      if (roles.length && !roles.includes(decodedRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have the required role.",
        });
      }
      next();
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token.",
      });
    }
  };
};

export default auth;
