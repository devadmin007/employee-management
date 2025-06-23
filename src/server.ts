import app from "./app";
import dotenv from "dotenv";
import { connectDB } from "./config/connection";
import { setupSwagger } from "./utils/swagger";
import { seedRole } from "./seeder";
dotenv.config();

const start = async () => {
  await connectDB();
  seedRole()
console.log(process.env.PORT)
  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
    setupSwagger(app, process.env.PORT);
  });
};

start();
