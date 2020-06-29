/**
 * 
 */
"use strict";


import { Router } from "express";

const router = Router();

/**
 * Setting securitySchemes in components will make all endpoints in this 
 * modyle protected and requests will require authorization header to contain 
 * a valid JWT token.
 * 
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT 
 *  
 */

/**
 * @swagger
 *    
 *  /{fileId}:
 *    get:
 *      description: Returns the requested file
 *      produces: 
 *        - application/json
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: fileId
 *          required: true
 *          type: string
 *          minimum: 1
 *          description: A description text.
 *      responses:
 *        200:
 *          description: hello world
 * 
 */
router.get("/:fileId", (req, res) => {
  let responsePayload = {
    access_token: "some token",
    requestedFile: req.params["fileId"],
    expires_in: 3600,
    scope: "customScope",
    token_type: "Bearer"
  };

  console.log(req.user);

  res.json(responsePayload);
});

module.exports = router;