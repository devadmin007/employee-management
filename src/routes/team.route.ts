import express from 'express';
import { createTeam, deleteTeam, getAllTeam, getTeamById, updateTeam } from '../controllers/team.controller';

const teamRouter = express.Router();



/**
 *  @openapi
 *  /api/create-team:
 *    post:
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




teamRouter.post('/create-team',createTeam);


/**
 *  @openapi
 *  /api/teams:
 *    get:
 *      tags: 
 *        - Team Controller
 *      summary : Get all Teams
 *      responses :
 *        '200':
 *          description : OK
 *        '404' :
 *          description : Not found    
 */

teamRouter.get('/teams',getAllTeam);

/**
 *  @openapi
 *  /api/team/{id}:
 *    get:
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

teamRouter.get('/team/:id',getTeamById);

/**
 *  @openapi
 *  /api/update-team/{id}:
 *    patch:
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


teamRouter.patch('/update-team/:id',updateTeam);


/**
 *  @openapi
 *  /api/delete-team/{id}:
 *    delete:
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
teamRouter.delete('/delete-team/:id',deleteTeam)

export default teamRouter;