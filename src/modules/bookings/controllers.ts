import { Request, Response } from "express";
import { bookingServices } from "./services";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.createBooking(req.body);

    res.status(201).json({
      success: true,
      massage: "Booking created successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      massage: "Booking cannot created.",
      errors: "Internal server error",
    });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.getUser();

    res.status(200).json({
      success: true,
      message: "user loaded successfully",
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
    const result = await bookingServices.updateUser(
      name,
      email,
      phone,
      role,
      req.params?.userId!
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

export const bookingController = {
  createBooking,
  getUser,
  updateUser,
};
