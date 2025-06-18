import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import {
  addDesignation,
  deletedesignationById,
  getAlldesignations,
  getdesignation,
  updatedesignationById,
} from "../controllers/designation.controller";

const designationRouter = express.Router();

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
 *  /api/add-designation:
 *    post:
 *      tags:
 *        - Designation Controller
 *      security:
 *       - bearerAuth: []
 *      summary : Add designation
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
 *
 *      responses :
 *        '201':
 *          description : Created
 *        '400' :
 *          descrription : Bad request
 *        '404' :
 *          description : Not found
 */

designationRouter.post("/add-designation", authMiddleware, authorization, addDesignation);


/**
 *  @openapi
 *  /api/designations:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Get all designations
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */

designationRouter.get("/designations", authMiddleware, authorization, getAlldesignations);



/**
 *  @openapi
 *  /api/designation/{id}:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Get a designation by ID
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
designationRouter.get("/designation/:id", authMiddleware, authorization, getdesignation);


/**
 *  @openapi
 *  /api/update-designation/{id}:
 *    patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Update a designation by ID
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
designationRouter.patch(
  "/update-designation/:id",
  authMiddleware,
  authorization,
  updatedesignationById
);


/**
 *  @openapi
 *  /api/delete-designation/{id}:
 *    delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Designation Controller
 *      summary : Delete a designation by ID
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
designationRouter.delete(
  "/delete-designation/:id",
  authMiddleware,
  authorization,
  deletedesignationById
);

export default designationRouter;
