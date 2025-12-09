import { Request, Response } from "express";
import { bookingServices } from "./services";
import { JwtPayload } from "jsonwebtoken";

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

const getBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.getBooking(req.user as JwtPayload);

    res.status(200).json({
      success: true,
      message: "Booking loaded successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      massage: "Booking cannot loaded successfully.",
      errors: "Please check you info and try again",
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const { status } = req.body;
  const requsetedId = req.params.bookingId as string;
  const { role, id } = req.user as JwtPayload;
  try {
    const result = await bookingServices.updateBooking(
      requsetedId,
      status,
      role,
      id
    );
    res.status(200).json(result);
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
  getBooking,
  updateBooking,
};
