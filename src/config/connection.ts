import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://root:root@cluster0.qnl6kj8.mongodb.net/");
    console.log(`MongoDB connected to ${config.mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
