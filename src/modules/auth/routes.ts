import { Router } from "express";
import { authController } from "./controllers";

const router = Router();

router.post("/signup", authController.userCreate);
router.post("/signin", authController.userLogin);

export const authRouter = router;
