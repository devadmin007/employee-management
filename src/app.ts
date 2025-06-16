import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route";
import managerRouter from "./routes/manager.route";
import teamRouter from "./routes/team.route";
import skillRouter from "./routes/skill.router";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", managerRouter);
app.use("/api", teamRouter);
app.use("/api",skillRouter)

export default app;
