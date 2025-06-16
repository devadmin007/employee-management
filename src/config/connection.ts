import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://tire-shop:s3W-jGZL4FchR_g@cluster0.ecveq.mongodb.net/Practical");
    console.log(`MongoDB connected to ${config.mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
