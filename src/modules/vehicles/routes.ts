import { Router } from "express";
import { vehicleController } from "./controllers";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth("admin"), vehicleController.createVehicle);

router.get("/", auth(), vehicleController.getVehicle);

router.get("/:vehicleId", vehicleController.singleVehicle);

router.put("/:vehicleId", auth("admin"), vehicleController.updateVehicle);

router.delete("/:vehicleId", auth("admin"), vehicleController.deleteVehicle);

export const vehiclesRouter = router;
