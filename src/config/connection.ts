import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://admin:admin@123@cluster0.o4pzn.mongodb.net/employee-management");
    console.log(`MongoDB connected to ${config.mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
