/**
 * 
 */
"use strict";

import { Router } from "express";
import { getConfig } from "../server/config";
import path from "path";
import fs from "fs";

import { sign } from "jsonwebtoken";

const router = Router();

const appConfig = getConfig();

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
router.post("/login", (req, res) => {
    // let user = new User(req.body.email, req.body.password);

    // TODO: 
    //  1- lookup user and hashed password from mongo db
    //  2- set Bearer JWT header if successful, and return success
    //  3- otherwise, return failure, with no header

    let responsePayload = {
        // expires_in: 3600,
        scope: "SVU",
        token_type: "JWT"
    };

    const secretKey = fs.readFileSync(path.resolve("./config", appConfig.get("app:ssl:key_file")));
    const opts = {
        expiresIn: 3600,
        audience: "localhost",
        issuer: "localhost",
        subject: "test_user"
    };

    const token = sign(responsePayload, secretKey, opts);
    console.log(token);

    res.set("authorization", "Bearer " + token);
    res.json(responsePayload);
})

/**
 * @swagger
 *  /logout:
 *      get:
 *          description: Returns the homepage
 *          produces: 
 *              - application/json
 *          responses:
 *              200:
 *                  description: hello world
 */
router.get("/logout", (req, res) => {
    let loginUrl = getConfig().get("login_url");

    // TODO:
    // 1- return an expired cookie
    // 2- redirect to login

    res.redirect(loginUrl);
})

module.exports = router;