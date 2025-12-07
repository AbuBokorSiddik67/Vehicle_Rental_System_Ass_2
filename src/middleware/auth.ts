import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization as string;
      if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        res.status(403).json({
          success: false,
          massage: "Unauthorized: Token missing or improperly formatted.",
        });
      }
      const token = authorizationHeader.split(" ")[1];
      if (!token) {
        return res.status(403).json({
          success: false,
          massage: "Forbidden: You are not authorized for this action.",
          errors: "please check your info and try again",
        });
      }

      const decoded = jwt.verify(
        token,
        config.token_secret as string
      ) as JwtPayload;
      req.user = decoded;

      const requestId = req.params?.userId;
      const decodedId = decoded.id;
      const decodedRole = decoded.role;

      if (requestId) {
        const isAdmin = decodedRole === "admin";
        const isOwn = requestId === decodedId;

        if (isAdmin && roles.includes("admin")) {
          next();
          return;
        }

        if (isOwn && roles.includes("customer")) {
          next();
          return;
        }

        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You are not authorized for this specific resource.",
        });
      }

      if (roles.length && !roles.includes(decodedRole as string)) {
        return res.status(403).json({
          success: false,
          massage: "unauthorized access",
          erros: "invaild info",
        });
      }

      next();
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token.",
        errors: "Token verification failed.",
      });
    }
  };
};

export default auth;
