import app from './app';
import { config } from 'dotenv';
import { connectDB } from './config/connection';

config(); 

const start = async () => {
    await connectDB();

    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
    });
}

start();