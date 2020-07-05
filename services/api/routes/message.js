/**
 * 
 */
"use strict";


import { v4 as uuidv4 } from "uuid";
import { Router } from "express";

const router = Router();
/**
 * Setting securitySchemes in components will make all endpoints in this 
 * module protected and requests will require authorization header to contain 
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
 *  /:
 *    get:
 *          description: Returns the homepage
 *          produces: 
 *              - application/json
 *          responses:
 *              200:
 *                  description: hello world * 
 */
router.get("/", (req, res) => {
  return res.send(Object.values(req.context.models.messages));
});

router.get("/:messageId", (req, res) => {
  return res.send(req.context.models.messages[req.params.messageId]);
});

router.post("/", (req, res) => {
  const id = uuidv4();
  const message = {
    id,
    text: req.body.text,
    userId: req.context.me.id,
  };

  req.context.models.messages[id] = message;

  return res.send(message);
});

router.delete("/:messageId", (req, res) => {
  const {
    [req.params.messageId]: message,
    ...otherMessages
  } = req.context.models.messages;

  req.context.models.messages = otherMessages;

  return res.send(message);
});

module.exports = router;