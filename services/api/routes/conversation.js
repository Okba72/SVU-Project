/**
 * 
 */
"use strict";


import { v4 as uuidv4 } from "uuid";
import { Router } from "express";
import { find, findOne, insertOne, updateOne } from "../server/database";
import { sendMessage } from "../lib/utils/ws_backend_client";
import isEmpty from "lodash/get";
import BlobHelper from "../lib/utils/blobHelper";
import CryptoHelper from "../lib/utils/cryptoHelper";

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
 *  /myConversations/{beforeTimeMillis}:
 *    get:
 *          description: Returns conversations last updated on or before beforeTimeMillis
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
 *                description: time in millies to fetch conversations last updated before
 *          responses:
 *              200:
 *                  description: hello world * 
 */
router.get("/myConversations/:beforeTimeMillis", async (req, res) => {

  let timeBefore;
  if (req.params["beforeTimeMillis"] && (parseInt(req.params["beforeTimeMillis"]) > 0)) {
    timeBefore = new Date(parseInt(req.params["beforeTimeMillis"]));
  } else {
    timeBefore = new Date();
  }

  let convs = await find("conversations",
    {
      date_last_updated: { $lt: timeBefore },
      user_list: req.user.userId
    },
    { limit: 100, sort: [["date_last_update", -1]], projection: { _id: 0, title_text: 1, user_list: 1 } }
  );

  // for (let aConv of convs) {
  //   // console.log(JSON.stringify(aConv, null, 4));  
  //   for (let aMsg of aConv.messages) {
  //     if (aMsg.shared_file) {
  //       aMsg.shared_file.fileUri = await BlobHelper.readFile(aMsg.shared_file.fileUri);
  //     }
  //   }
  // }

  let tempObj = {
    conversations: convs
  }
  return res.json(tempObj);
});


/**
 * @swagger
 * 
 *  /sharedFile/{conversationId}/{fileHash}:
 *    get:
 *          description: Returns shared file for the specified conversationId, and file hash
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: conversationId
 *                required: true
 *                type: string
 *                description: conversationId for which messages are to be fetched.
 *              - in: path
 *                name: fileHash
 *                required: true
 *                type: string
 *                description: file hash to retrieve.
 *          responses:
 *              200:
 *                  description: TBD * 
 */
router.get("/sharedFile/:conversationId/:fileHash", async (req, res) => {
  let conversationId = req.params["conversationId"];
  let fileHash = req.params["fileHash"];


  // console.log(`conversationId ${conversationId}`);
  // console.log(`type of conversationId ${typeof (conversationId)}`);
  // console.log(`fileHash ${fileHash}`);
  // console.log(`type of fileHash ${typeof (fileHash)}`);

  // console.log(`req.user.userId is: ${req.user.userId}`);

  let aConversation = await findOne("conversations",
    {
      _id: conversationId,
      'messages.shared_file.fileUri': fileHash,
      user_list: req.user.userId,  // this is very important for security, only messages for user conversations are fetched.
    },
    { limit: 1000, sort: [["date_last_update", -1]], projection: { _id: 0, title_text: 1, user_list: 1, 'messages.shared_file': 1 } }
  );

  if (!aConversation | isEmpty(aConversation)) {
    return res.json({});
  }


  let fileUri = await BlobHelper.readFile(fileHash);

  res.header("Content-Type", "application/png");
  res.write(fileUri);
  res.end();
});

/**
 * @swagger
 * 
 *  /sharedFileDescriptor/{conversationId}/{fileName}/{fileType}/{fileUri}:
 *    get:
 *          description: Returns shared file download token for the specified conversationId, and file descriptor
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: conversationId
 *                required: true
 *                type: string
 *                description: conversationId for which messages are to be fetched.
 *              - in: path
 *                name: fileName
 *                required: true
 *                type: string
 *                description: name of a file.
 *              - in: path
 *                name: fileType
 *                required: true
 *                type: string
 *                description: MIME type of a file.
 *              - in: path
 *                name: fileUri
 *                required: true
 *                type: string
 *                description: hex hash of file URI.
 *          responses:
 *              200:
 *                  description: TBD * 
 */
router.get("/sharedFileDescriptor/:conversationId/:fileName/:fileType/:fileUri", async (req, res) => {
  let conversationId = req.params["conversationId"];
  let fileName = req.params["fileName"];
  let fileType = req.params["fileType"];
  let fileUri = req.params["fileUri"];


  console.log(`conversationId: ${conversationId}`);
  console.log(`fileName: ${fileName}`);
  console.log(`fileType: ${fileType}`);
  console.log(`fileUri: ${fileUri}`);

  let aConversation = await findOne("conversations",
    {
      _id: conversationId,
      'messages.shared_file.fileUri': fileUri,
      user_list: req.user.userId,  // this is very important for security, only messages for user conversations are fetched.
    },
    { limit: 1000, sort: [["date_last_update", -1]], projection: { _id: 0, title_text: 1, user_list: 1, 'messages.shared_file': 1 } }
  );

  if (!aConversation | isEmpty(aConversation)) {
    return res.json({});
  }

  let fileDescrStr = CryptoHelper.ecnryptBlobDownloadDescriptor(req.user.userId, conversationId, fileName, fileType, fileUri);

  let tempObj = {
    fileDescrStr,
  }
  return res.json(tempObj);
});



/**
 * @swagger
 * 
 *  /messages/{conversationId}/{beforeTimeMillis}:
 *    get:
 *          description: Returns all messages for the specified conversationId, dated on or before beforeTimeMillis
 *          produces: 
 *              - application/json
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - in: path
 *                name: conversationId
 *                required: true
 *                type: string
 *                description: conversationId for which messages are to be fetched.
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
router.get("/messages/:conversationId/:beforeTimeMillis", async (req, res) => {

  // console.log(`\n\nentering ${"/messages/:conversationId/:beforeTimeMillis"}\n\n`)
  let conversationId = req.params["conversationId"];

  let timeBefore;
  if (req.params["beforeTimeMillis"] && (parseInt(req.params["beforeTimeMillis"]) > 0)) {
    timeBefore = new Date(parseInt(req.params["beforeTimeMillis"]));
  } else {
    timeBefore = new Date();
  }

  /**
   * The following check is for security reasons.
   * If the session user ()req.user.userId is not in the user_list of the conversation, then
   * the session user is prohibited to spy on the existing conversation.
   * 
   * This is very important
   */
  let aConversation = await findOne("conversations",
    {
      _id: conversationId,
      'messages.message_time': { $lt: timeBefore },
      user_list: req.user.userId,  // this is very important for security, only messages for user conversations are fetched.
    },
    { limit: 1000, sort: [["date_last_update", -1]], projection: { _id: 0, title_text: 1, user_list: 1, messages: 1 } }
  );

  if (!aConversation | isEmpty(aConversation)) {
    return res.json({});
  }

  let tempObj = {
    aConversation
  }
  return res.json(tempObj);
});






/**
 * @swagger
 *  /newMessage:
 *      post:
 *          description: Adds a new message to a conversation
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
 *                              conversationId:
 *                                  type: string
 *                              message:
 *                                  type: object
 *                                  properties:
 *                                      messageText:
 *                                          type: string
 *                                      sharedFile:
 *                                          type: object
 *                                          properties:
 *                                            fileName:
 *                                              type: string
 *                                            fileSize:
 *                                              type: integer
 *                                            fileType:
 *                                              type: string
 *                                            fileUri:
 *                                              type: string
 *                                          required:
 *                                              - fileName
 *                                              - fileSize
 *                                              - fileType
 *                                              - fileUri
 *                                  required:
 *                                      - messageText
 *                          required:
 *                              - conversationId
 *                              - message
 *          responses:  
 *              200:
 *                  description: new message added
 */
router.post("/newMessage", async (req, res) => {
  const id = uuidv4();
  const messageTime = new Date();

  let conversationId = req.body["conversationId"];
  let message = req.body["message"];
  // console.log(`\n\nreq.body: ${JSON.stringify(req.body, 4, null)}\n\n`)

  let existingConv = await findOne("conversations",
    {
      _id: conversationId,
      user_list: req.user.userId,  // this is very important for security, only user conversations are are allowed to include the new message.
    },
    { projection: { _id: 0, title_text: 1, user_list: 1 } });


  if (!existingConv | isEmpty(existingConv)) {
    return res.json({});
  }

  if (message.sharedFile) {
    let tempFileURI = message.sharedFile.fileUri;
    let blobFileUri = await BlobHelper.writeFile(tempFileURI);

    // console.log(`\n\n ${blobFileUri}\n\n`);

    message.sharedFile.fileUri = blobFileUri;
  }

  let insOp = await updateOne("conversations",
    { _id: conversationId },
    {
      $push: {
        messages: {
          _id: id,
          message_time: messageTime,
          sender: req.user.userId,
          message_text: message.messageText,
          shared_file: message.sharedFile,
        }
      }
    })

  if (insOp.result.nModified == 1) {
    const conversation = {
      conversationId: existingConv._id,
      userList: existingConv.user_list,
      titleText: existingConv.title_text,
    };

    const wsMessage = {
      endPoint: "conversation",
      conversation: conversation,
    }

    try {
      // TODO: get the wss url from redis
      // console.log(wsMessage);
      await sendMessage("wss://localhost:18001", wsMessage);
    } catch (err) {
      console.log(err);
    }

    return res.json({});
  } else {
    return res.status(400).json({});
  }
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
  let userList = req.body["userList"];
  let titleText = req.body["titleText"];

  // console.log(`new conversation for: ${userList.join(",")} created.`);

  let insOp = await updateOne("conversations",
    { date_last_updated: null },
    { $set: { user_list: userList, title_text: titleText, unread: true, messages: [] } },
    { upsert: true, })


  if (insOp.result.ok == 1) {
    const conversation = {
      conversationId: insOp.upsertedId._id,
      userList,
      titleText,
    };

    const wsMessage = {
      endPoint: "conversation",
      conversation: conversation,
    }

    try {
      // TODO: get the wss url from redis
      // console.log(wsMessage);
      await sendMessage("wss://localhost:18001", wsMessage);
    } catch (err) {
      console.log(err);
    }

    return res.json(conversation);
  } else {
    return res.status(400).json({});
  }
});


/**
 * @swagger
 *  /leave:
 *      post:
 *          description: leaves a conversation identified by conversationId
 *          produces: 
 *              - application/json
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              description: conversation id to leave
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              conversation_id: 
 *                                  type: string
 *                          required:
 *                              - conversation_id
 *          responses:  
 *              200:
 *                  description: conversation leave succeeded
 */
router.post("/leave", async (req, res) => {

  let conversationId = req.body["conversationId"];

  // console.log("leaving conversation: " + conversationId);

  let existingConv = await findOne("conversations",
    {
      _id: conversationId,
      user_list: req.user.userId,  // this is very important for security, only user conversations are are allowed to include the new message.
    },
    { projection: { _id: 0, user_list: 1 } });


  if (!existingConv | isEmpty(existingConv)) {
    return res.json({});
  }

  let insOp = await updateOne("conversations",
    { _id: conversationId },
    {
      $pull: {
        user_list: req.user.userId,
      }
    }
  )

  if (insOp.result.nModified == 1) {
    const conversation = {
      conversationId: existingConv._id,
      userList: existingConv.user_list,
      titleText: existingConv.title_text,
    };

    const wsMessage = {
      endPoint: "conversation",
      conversation: conversation,
    }

    try {
      // TODO: get the wss url from redis
      // console.log(wsMessage);
      await sendMessage("wss://localhost:18001", wsMessage);
    } catch (err) {
      console.log(err);
    }

    return res.json({});
  } else {
    return res.status(400).json({});
  }
});

module.exports = router;