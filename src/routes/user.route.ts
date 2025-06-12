import express from 'express';
import { createUser, loginUser } from '../controllers/user.controller';


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
 *                - password
 *                - role
 *              properties : 
 *                username : 
 *                  type : string
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

userRouter.post('/register', createUser);

/**
 *  @openapi
 *  /
 * wqapi/login:
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


userRouter.post('/login',  loginUser); 

export default userRouter;