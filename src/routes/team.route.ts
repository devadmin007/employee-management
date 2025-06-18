import express from "express";
import {
  createTeam,
  deleteTeam,
  getAllTeam,
  getTeamById,
  updateTeam,
} from "../controllers/team.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";

const teamRouter = express.Router();

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
 *  @openapi
 *  /api/create-team:
 *    post:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Create a Team
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - label
 *                - managerId
 *              properties :
 *                label :
 *                  type : string
 *                managerId :
 *                  type : string
 *                  description: ID of the team manager
 *
 *      responses :
 *        '201':
 *          description : Created
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

teamRouter.post("/create-team", authMiddleware, authorization, createTeam);

/**
 *  @openapi
 *  /api/teams:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Get all Teams
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */

teamRouter.get("/teams", authMiddleware, authorization, getAllTeam);

/**
 *  @openapi
 *  /api/team/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Get a Team by ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses :
 *        '200':
 *          description : OK
 *
 *
 *        '404' :
 *          description : Not found
 */

teamRouter.get("/team/:id", authMiddleware, authorization, getTeamById);

/**
 *  @openapi
 *  /api/update-team/{id}:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Update a Team by ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - label
 *              properties :
 *                label :
 *                  type : string
 *
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */

teamRouter.patch("/update-team/:id", authMiddleware, authorization, updateTeam);

/**
 *  @openapi
 *  /api/delete-team/{id}:
 *    delete:
 *      security:
 *        - bearerAuth: []
 *      tags:
 *        - Team Controller
 *      summary : Delete a Team by ID
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */
teamRouter.delete(
  "/delete-team/:id",
  authMiddleware,
  authorization,
  deleteTeam
);

export default teamRouter;
