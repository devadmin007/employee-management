import dotenv from 'dotenv';


const env = process.env.NODE_ENV || '';

dotenv.config()
export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '' as string,
  env,
};
