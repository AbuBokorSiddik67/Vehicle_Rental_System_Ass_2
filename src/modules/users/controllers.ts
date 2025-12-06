import { Request, Response } from "express";
import { userServices } from "./services";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      massage: "User cannot created successfully",
      errors: "Check your info and try again",
    });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUser();

    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      massage: "Forbidden Access",
      errors: "Please check you info and try again",
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { name, email, phone, role } = req.body;
  try {
    const result = await userServices.updateUser(
      name,
      email,
      phone,
      role,
      req.params.userId!
    );
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      massage: "User cannot updated successfully",
      errors: "Check your info and try again",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.deleteUser(req.params.userId!);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "User cannot deleted",
      errors: "Internal server error",
    });
  }
};

export const userController = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
