import { Request, Response } from "express";
import { vehicleServices } from "./services";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.createVehicle(req.body);
    res.status(201).json({
      success: true,
      massage: "Vehicle created successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      massage: "Vehicle cannot created.",
      errors: "Sever problem try again later.",
    });
  }
};

const getVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicle();

    res.status(200).json({
      success: true,
      message: "Vehicles loaded successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      massage: "Vehicles cannot created.",
      errors: "Please check you info and try again",
    });
  }
};

const singleVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.singleVehicle(
      req.params.vehicleId as string
    );

    res.status(200).json({
      success: true,
      message: "Vehicle data loaded successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      massage: "Vehicle data not found",
      errors: "Please check you info and try again",
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;
  try {
    const result = await vehicleServices.updateVehicle(
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      req.params?.vehicleId!
    );
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      massage: "Vehicle cannot updated successfully",
      errors: "Check your info and try again",
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.deleteVehicle(req.params?.vehicleId!);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Vehicle cannot deleted",
      errors: "Internal server error",
    });
  }
};

export const vehicleController = {
  createVehicle,
  getVehicle,
  singleVehicle,
  updateVehicle,
  deleteVehicle,
};
