import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";

import { getSalaryById, getSalaryList } from "../controllers/salary.controller";

const salaryRoute = express.Router();
/**
 * @openapi
 * /api/salary-list:
 *   get:
 *     summary: Get list of employee salaries
 *     tags:
 *       - Salary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by full name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number (applies only when pagination is enabled).
 *       - in: query
 *         name: itemsPerPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page (applies only when pagination is enabled).
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           example: createdAt
 *         description: Field to sort by (applies only when pagination is enabled).
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc, ASC, DESC, 1, -1]
 *         description: Sort order (ascending or descending).
 *     responses:
 *       200:
 *         description: Salary list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Salary list fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           netSalary:
 *                             type: number
 *                           month:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           isDeleted:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           employee_full_name:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
salaryRoute.get("/salary-list", authMiddleware, authorization, getSalaryList);

salaryRoute.get('/salary/:id',authMiddleware,authorization,getSalaryById)

export default salaryRoute;
