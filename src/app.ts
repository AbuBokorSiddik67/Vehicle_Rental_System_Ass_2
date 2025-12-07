import express, { Request, Response } from "express";
import initDB from "./config/db";
import { userRouter } from "./modules/users/routes";
import { authRouter } from "./modules/auth/routes";
const app = express();
app.use(express.json());

// DB initialize...
initDB();

app.get("/", (req, res) => {
  res.send("vehicle rental system server is running...");
});
//* Auth Data
app.use("/api/v1/auth", authRouter);
//* User Data *//
app.use("/api/v1/users", userRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "this page not found",
  });
});

export default app;
