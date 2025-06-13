import express from 'express';
import { createManager, deleteManager, getAllManagers, getManagerById, updateManager } from '../controllers/manager.controller';


const managerRouter = express.Router();


/**
 *  @openapi
 *  /api/create-manager:
 *    post:
 *      tags: 
 *        - Manager Controller
 *      summary : Create a Manager
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


managerRouter.post('/create-manager', createManager);


/**
 *  @openapi
 *  /api/managers:
 *    get:
 *      tags: 
 *        - Manager Controller
 *      summary : Get all Managers
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found    
 */
managerRouter.get('/managers', getAllManagers); 


/**
 *  @openapi
 *  /api/manager/{id}:
 *    get:
 *      tags: 
 *        - Manager Controller
 *      summary : Get a Manager by ID
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
managerRouter.get('/manager/:id',getManagerById);

/**
 *  @openapi
 *  /api/update-manager/{id}:
 *    patch:
 *      tags: 
 *        - Manager Controller
 *      summary : Update a Manager by ID
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
managerRouter.patch('/update-manager/:id',updateManager);


/**
 *  @openapi
 *  /api/delete-manager/{id}:
 *    delete:
 *      tags: 
 *        - Manager Controller
 *      summary : Delete a Manager by ID
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
managerRouter.delete('/delete-manager/:id',deleteManager)

export default managerRouter;
