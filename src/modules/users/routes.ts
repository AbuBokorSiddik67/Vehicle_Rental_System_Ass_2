import { Router } from "express";
import { userController } from "./controllers";

const router = Router();

router.post("/", userController.createUser);
router.get("/", userController.getUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

export const userRouter = router;
