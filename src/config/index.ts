import dotenv from 'dotenv';
// import path from 'path';

const env = process.env.NODE_ENV || 'development';
// dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });
dotenv.config()
export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '' as string,
  env,
};
