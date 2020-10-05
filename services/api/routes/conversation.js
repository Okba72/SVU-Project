/**
 * 
 */
"use strict";


import { v4 as uuidv4 } from "uuid";
import { Router } from "express";
import { find, findOne, insertOne, updateOne } from "../server/database";


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
 *  /myConversations/{beforeTimeMillis}:
 *    get:
 *          description: Returns the homepage
 *          produces: 
 *              - application/json
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: beforeTimeMillis
 *                required: false
 *                type: integer
 *                default: 0
 *                description: time in millies to fetch conversations before
 *          responses:
 *              200:
 *                  description: hello world * 
 */
router.get("/myConversations/:beforeTimeMillis", async (req, res) => {

  let timeBefore;
  if (req.params["beforeTimeMillis"]) {
    timeBefore = new Date(parseInt(req.params["beforeTimeMillis"]));
  } else {
    timeBefore = new Date();
  }

  let convs = await find("conversations",
    {
      date_last_updated: { $lt: timeBefore },
      user_list: req.user.userId
    },
    { limit: 30, sort: [["date_last_update", -1]], projection: { _id: 0, title_text: 1, user_list: 1 } });

  let tempObj = {
    conversations: convs
  }
  return res.json(tempObj);
});


/**
 * @swagger
 *  /create:
 *      post:
 *          description: Creates a new conversation
 *          produces: 
 *              - application/json
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              description: attributes necessary to create a new conversation.
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              userList:
 *                                  type: array
 *                                  items: 
 *                                     type: string
 *                              titleText: 
 *                                  type: string
 *                                  default: "_"
 *                          required:
 *                              - userList
 *          responses:  
 *              200:
 *                  description: new conversation created
 */
router.post("/create", async (req, res) => {
  const id = uuidv4();

  let userList = req.body["userList"];
  let titleText = req.body["titleText"];

  console.log(`new conversation for: ${userList.join(",")} created.`);


  let insOp = await updateOne("conversations", { date_last_updated: null }, { $set: { user_list: userList, title_text: titleText } }, { upsert: true, })


  if (insOp.result.ok = 1) {
    const conversation = {
      conversationId: insOp.upsertedId._id,
      userList,

    };
    return res.json(conversation);
  } else {
    return res.status(400);
  }
});

router.delete("/:conversatioinId", (req, res) => {
  const {
    [req.params.conversationId]: conversation,
    ...otherConversations
  } = req.context.models.conversation;

  req.context.models.conversation = otherConversations;

  return res.send(conversation);
});

module.exports = router;