/**
 * 
 */
"use strict";

import { Router } from "express";
import { getConfig } from "../server/config";
import path from "path";
import fs from "fs";
import { URL } from "url";

import { sign } from "jsonwebtoken";

import CryptoHelper from "../lib/utils/cryptoHelper";

import ImageHelper from "../lib/utils/imageHelper";

import AppLoggerFactory from "../server/appLogger";
import { findOne, insertOne, updateOne } from "../server/database";

const router = Router();

const appConfig = getConfig();

const run_mode = appConfig.get("NODE_ENV") || "development";

const logger = AppLoggerFactory.getLogger(
    "Session", run_mode === "production"
    ? "WARN"
    : "DEBUG");

/**
 * This module does not require its endpoint to be secured/protected.
 * 
 */

/**
 * @swagger
 *  /login:
 *      post:
 *          description: Validates user ID and password, and returns JWT header on success.
 *          produces: 
 *              - application/json
 *          requestBody:
 *              description: Optional description in *Markdown*
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              userId:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                          required:
 *                              - userId
 *                              - password
 *          responses:  
 *              200:
 *                  description: Login successful, response authorization header contains JWT token.
 */
router.post("/login", async (req, res) => {
    // let user = new User(req.body.email, req.body.password);
    //  1- lookup user and hashed password from mongo db, if user does not exist, return 401
    //  2- set Bearer JWT header if successful, and return success

    let userId = req.body["userId"];
    let password = req.body["password"];

    if (!CryptoHelper.validateEmail(userId)) {
        return res.status(400).send("Invalid user ID");
    }

    let existingAccount = await findOne("users", { user_id: userId });
    if (!existingAccount || !existingAccount.active) {
        return res.status(401).send("Unauthorized");
    }

    if (!CryptoHelper.validatePassword(password, existingAccount.password)) {
        return res.status(401).send("Unauthorized");
    }

    let jwtId = existingAccount.jwt_id;
    if (!jwtId) {
        jwtId = CryptoHelper.genRandomString(16);
        await updateOne("users", { user_id: userId }, { $set: { jwt_id: jwtId } });
    }

    let expireTimeMillis = (new Date()).getTime() + 3600000;
    let responsePayload = {
        scope: "SVU",
        token_type: "JWT",
        expireTimeMillis: expireTimeMillis,
    };

    const secretKey = fs.readFileSync(path.resolve("./config", appConfig.get("app:ssl:key_file")));
    const domainUrl = new URL(appConfig.get("external_server_url"));
    const opts = {
        expiresIn: 3600,
        audience: domainUrl.hostname,
        issuer: domainUrl.hostname,
        subject: userId,
        jwtid: jwtId,
    };

    const token = sign(responsePayload, secretKey, opts);

    res.set("authorization", "Bearer " + token);
    res.json(responsePayload);
})

/**
 * Upon credentials validation, the existing jwt_id in the db account is nullified
 * This will render all auth tokens invalid immediately.
 * 
 * @swagger
 *  /logoutAllDevices:
 *      post:
 *          description: logout user sessions on all devices (invalidate all auth tokens immediately).
 *          produces: 
 *              - application/json
 *          requestBody:
 *              description: Optional description in *Markdown*
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              userId:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                          required:
 *                              - userId
 *                              - password
 *          responses:  
 *              200:
 *                  description: logout successful, all issued auth token are invalid.
 */
router.post("/logoutAllDevices", async (req, res) => {
    let loginUrl = getConfig().get("login_url");

    let userId = req.body["userId"];
    let password = req.body["password"];


    if (!CryptoHelper.validateEmail(userId)) {
        return res.status(400).send("Invalid user ID");
    }

    let existingAccount = await findOne("users", { user_id: userId });
    if (!existingAccount || !existingAccount.active) {
        return res.status(401).send("Unauthorized");
    }

    if (!CryptoHelper.validatePassword(password, existingAccount.password)) {
        return res.status(401).send("Unauthorized");
    }

    await updateOne("users", { user_id: userId }, { $set: { jwt_id: "" } });

    res.redirect(loginUrl);
})


/**
 * A random image with malformed/twisted text is randomely selected.  Then
 *  the userId and the comprised text in the image are used to generate a token
 *  which is send along with the base-64 encoding of the image.
 * 
 * @swagger
 *  /getNARToken/{userId}:
 *    get:
 *      description: Returns a not-a-robot image and token
 *      produces: 
 *        - application/json
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          required: true
 *          type: string
 *          minimum: 1
 *          description: userId for obtaining a temporary NAR token.
 *      responses:
 *        200:
 *          description: the response contains a valid temporary NAR information
 */
router.get("/getNARToken/:userId", async (req, res) => {
    let userId = req.params["userId"];
    if (!CryptoHelper.validateEmail(userId)) {
        return res.status(400).send("Invalid email sent as userId.");
    }

    let pngFiles = await ImageHelper.getPngFiles("./resources/nar_images/");

    let rndPngFile = pngFiles[Math.floor(Math.random() * pngFiles.length)];


    let imageB64 = ImageHelper.getImageAsBase64(rndPngFile);
    let re = RegExp("\.*/nar_(.*).png");

    let matchArr = re.exec(rndPngFile);
    let narToken = CryptoHelper.ecnryptNaRAttributes(req.params["userId"], matchArr[1]);

    logger.info("narClear: " + req.params["userId"] + ":" + matchArr[1]);

    let responsePayload = {
        narToken: narToken,
        narImageBase64: imageB64,
        narUserId: req.params["userId"],
    }

    return res.json(responsePayload);
})


/**
 * @swagger
 *  /signup:
 *      post:
 *          description: Creates an account with initial password.
 *          produces: 
 *              - application/json
 *          requestBody:
 *              description: Necessary information to signup.
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              userId:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                              narToken:
 *                                  type: string
 *                              narText:
 *                                  type: string
 *                          required:
 *                              - userId
 *                              - password
 *                              - narToken
 *                              - narText
 *          responses:  
 *              301:
 *                  description: signup successful, response is redirection to login 
 */
router.post("/signup", async (req, res) => {
    let loginUrl = getConfig().get("login_url");
    let userId = req.body["userId"];
    let password = req.body["password"];
    let narToken = req.body["narToken"];
    let narText = req.body["narText"];

    if (!CryptoHelper.validateEmail(userId)) {
        return res.status(400).send("Invalid email sent as userId.");
    }

    if (!password || (password.length < 12)) {
        return res.status(400).send("password length must be >= 12 characters");
    }

    let narClear = CryptoHelper.decryptNaRToken(narToken);
    if (userId.concat(":", narText) != narClear) {
        return res.status(403).send("Robots are forbidden");
    }

    let existingAccount = await findOne("users", { user_id: userId });
    if (existingAccount) {
        return res.redirect(loginUrl);
    }

    // at this point, everything is ok to create the account and activate it:
    let newAcount = {
        user_id: userId,
        password: CryptoHelper.genPasswordHash(password),
        jwt_id: "",
        active: true
    }
    await insertOne("users", newAcount);

    res.redirect(loginUrl);
})

/**
 * @swagger
 *  /changePassword:
 *      post:
 *          description: Validates user ID and password, and sets new password on success.
 *          produces: 
 *              - application/json
 *          requestBody:
 *              description: Optional description in *Markdown*
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              userId:
 *                                  type: string
 *                              oldPassword:
 *                                  type: string
 *                              newPassword:
 *                                  type: string
 *                          required:
 *                              - userId
 *                              - oldPassword
 *                              - newPassword
 *          responses:  
 *              200:
 *                  description: response will redirect to login.
 */
router.post("/changePassword", async (req, res) => {
    let loginUrl = getConfig().get("login_url");
    let userId = req.body["userId"];
    let oldPassword = req.body["oldPassword"];
    let newPassword = req.body["newPassword"];

    if (!CryptoHelper.validateEmail(userId)) {
        return res.status(400).send("Invalid user ID");
    }

    if (!newPassword || (newPassword.length < 12) || (oldPassword == newPassword)) {
        return res.status(400).send("new password length must be >= 12 characters, and different from old one");
    }

    let existingAccount = await findOne("users", { user_id: userId });
    if (!existingAccount || !existingAccount.active) {
        return res.status(401).send("Unauthorized");
    }

    if (!CryptoHelper.validatePassword(oldPassword, existingAccount.password)) {
        return res.status(401).send("Unauthorized");
    }

    let newPasswordHash = CryptoHelper.genPasswordHash(newPassword);
    await updateOne("users", { user_id: userId },
        {
            $set: {
                jwt_id: "",
                password: newPasswordHash
            }
        });

    res.redirect(loginUrl);
})


module.exports = router;