import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import { addSalary } from "../controllers/salary.controller";


const salaryRoute = express.Router();


salaryRoute.post('/add-salary',addSalary);

export default salaryRoute
