import express from "express";
import { addLeave, getLeaveById, leaveList, updateLeave } from "../controllers/leave.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const leaveRouter = express.Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /api/add-leave:
 *   post:
 *     summary: Create a new leave request
 *     tags: [Leave]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_type
 *               - startDate
 *               - endDate
 *               - status
 *               - comments
 *             properties:
 *               leave_type:
 *                 type: string
 *                 enum: [FIRST_HALF, SECOND_HALF, FULL_DAY]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECT]
 *               comments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave successfully created
 */


leaveRouter.post('/add-leave',authMiddleware,addLeave);
leaveRouter.get('/leave/:id',getLeaveById)
leaveRouter.get('/leave-list',authMiddleware,leaveList);
leaveRouter.patch('/update-leave/:id',authMiddleware,updateLeave)


export default leaveRouter;