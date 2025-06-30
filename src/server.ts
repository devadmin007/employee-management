import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/connection";
import { setupSwagger } from "./utils/swagger";
import nodeCron from "node-cron";
import { createAdminUser, seedRole } from "./seeder";
import { generateSalary } from "./controllers/salary.controller";
dotenv.config();

const start = async () => {
  await connectDB();
  // createAdminUser();
  seedRole();

  // seedRole();

  // nodeCron.schedule("*/10 * * * * *", () => {
  // console.log('Monthly salary function');
  // generateSalary()
  // });
  console.log(process.env.PORT)
  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
    setupSwagger(app, process.env.PORT);
  });
};

start();
