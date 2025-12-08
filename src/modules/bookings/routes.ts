import { Router } from "express";
import { bookingController } from "./controllers";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", bookingController.createBooking)
// router.get("/", auth("admin"));
// router.put("/:userId", auth("admin", "customer"));

export const bookingRouter = router;
