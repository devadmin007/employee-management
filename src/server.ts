import app from './app';
import dotenv from "dotenv";
import { connectDB } from './config/connection';
import { setupSwagger } from './utils/swagger';
dotenv.config();


const start = async () => {
  await connectDB();

  app.listen(process.env.PORT, () => {
    console.log(
      `🚀 Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
    setupSwagger(app, process.env.PORT);
  });
};

start();
