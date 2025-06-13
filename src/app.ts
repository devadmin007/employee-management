import express from 'express';
import cors from 'cors'
import userRouter from './routes/user.route';
import managerRouter from './routes/manager.route';


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', userRouter);
app.use('/api', managerRouter)

export default app;