import { Request, Response } from "express";
import { authServices } from "./services";

const userCreate = async (req: Request, res: Response) => {
  try {
    const result = await authServices.userCreate(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "User cannot registered",
      errors: "internal server errors",
    });
  }
};

const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authServices.userLogin(email, password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const authController = {
  userCreate,
  userLogin,
};
