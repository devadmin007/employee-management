import express from "express";
import {
  createUser,
  getUserId,
  loginUser,
  userCreate,
  updateUserDetaisById,
  getAllRole,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload";

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

/**
 * @openapi
 * /api/add-user:
 *   post:
 *     summary: Create a new user with employee details
 *     tags:
 *       - User Controller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - role
 *               - managerId
 *               - designationId
 *               - primarySkills
 *               - bankDetails.accountNumber
 *               - bankDetails.ifscCode
 *               - bankDetails.branchName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Role ObjectId
 *               managerId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               countryCode:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               personalNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               probationDate:
 *                 type: string
 *                 format: date
 *               panNo:
 *                 type: string
 *               aadharNo:
 *                 type: string
 *               currentSalary:
 *                 type: string
 *               previousExperience:
 *                 type: string
 *               pfNo:
 *                 type: string
 *               uanDetail:
 *                 type: string
 *               esicNo:
 *                 type: string
 *               esicStart:
 *                 type: string
 *                 format: date
 *               esicEnd:
 *                 type: string
 *                 format: date
 *               relieivingDate:
 *                 type: string
 *                 format: date
 *               teamId:
 *                 type: string
 *               designationId:
 *                 type: string
 *               department:
 *                 type: string
 *               primarySkills:
 *                 type: string
 *               secondarySkills:
 *                 type: string
 *               permenentAddress.street:
 *                 type: string
 *               permenentAddress.city:
 *                 type: string
 *               permenentAddress.state:
 *                 type: string
 *               permenentAddress.country:
 *                 type: string
 *               permenentAddress.zip:
 *                 type: string
 *               currentAddress.street:
 *                 type: string
 *               currentAddress.city:
 *                 type: string
 *               currentAddress.state:
 *                 type: string
 *               currentAddress.country:
 *                 type: string
 *               currentAddress.zip:
 *                 type: string
 *               bankDetails.accountNumber:
 *                 type: string
 *               bankDetails.ifscCode:
 *                 type: string
 *               bankDetails.branchName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     image:
 *                       type: string
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

userRouter.post(
  "/add-user",
  authMiddleware,
  authorization,
  upload.single("image"),
  userCreate
);
userRouter.get(
  "/fetched-userdetails/:id",
  authMiddleware,
  authorization,
  getUserId
);
userRouter.patch(
  "/update-userdetails",
  authMiddleware,
  authorization,
  updateUserDetaisById
);
/**
 *  @openapi
 *
 *  /api/roles:
 *    get:
 *      tags:
 *        - User Controller
 *      summary : get all role api
 *      responses :
 *        '200':
 *          description : OK
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */
userRouter.get('/roles',getAllRole)
export default userRouter;
