import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/validate.middleware";
import {
  addHoliday,
  deleteHolidayById,
  getAllHolidays,
  getHoliday,
  updateHolidayById,
} from "../controllers/holiday.controller";

const holidayRouter = express.Router();

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
 *  /api/add-holiday:
 *    post:
 *      tags:
 *        - Holiday Controller
 *      security:
 *       - bearerAuth: []
 *      summary : Add Holiday
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

holidayRouter.post("/add-holiday", authMiddleware, authorization, addHoliday);


/**
 *  @openapi
 *  /api/holidays:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Get all holidays
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found
 */

holidayRouter.get("/holidays", authMiddleware, authorization, getAllHolidays);



/**
 *  @openapi
 *  /api/holiday/{id}:
 *    get:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Get a Holiday by ID
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
holidayRouter.get("/holiday/:id", authMiddleware, authorization, getHoliday);


/**
 *  @openapi
 *  /api/update-holiday/{id}:
 *    patch:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Update a holiday by ID
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
holidayRouter.patch(
  "/update-holiday/:id",
  authMiddleware,
  authorization,
  updateHolidayById
);


/**
 *  @openapi
 *  /api/delete-holiday/{id}:
 *    delete:
 *      security:
 *       - bearerAuth: []
 *      tags:
 *        - Holiday Controller
 *      summary : Delete a Holiday by ID
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
holidayRouter.delete(
  "/delete-holiday/:id",
  authMiddleware,
  authorization,
  deleteHolidayById
);

export default holidayRouter;
