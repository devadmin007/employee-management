import express from "express";
import { createUser, getUserId, loginUser, userCreate,updateUserDetaisById } from "../controllers/user.controller";

const userRouter = express.Router();

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
 *  /api/register:
 *    post:
 *      tags:
 *        - User Controller
 *      summary : Create an User
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - username
 *                - firstName
 *                - lastName
 *                - password
 *                - role
 *              properties :
 *                username :
 *                  type : string
 *                firstName : 
 *                  type : string
 *                lastName :
 *                  type: string
 *                password :
 *                  type : string
 *                role :
 *                  type : string
 *
 *      responses :
 *        '201':
 *          description : Created
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

userRouter.post("/register", createUser);

/**
 *  @openapi
 *
 *  /api/login:
 *    post:
 *      tags:
 *        - User Controller
 *      summary : Login an User
 *      requestBody :
 *        required : true
 *        content :
 *          application/json:
 *            schema:
 *              type: object
 *              required :
 *                - username
 *                - password
 *
 *              properties :
 *                username :
 *                  type : string
 *                password :
 *                  type : string
 *
 *      responses :
 *        '200':
 *          description : OK
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

userRouter.post("/login", loginUser);
userRouter.post("/add", userCreate);
userRouter.get("/fetched/:id", getUserId);
userRouter.patch("/update-user", updateUserDetaisById)

export default userRouter;
