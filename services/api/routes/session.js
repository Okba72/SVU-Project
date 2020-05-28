/**
 * 
 */
"use strict";

import { Router } from 'express';
import { getConfig } from "../server/config";

const router = Router();


/**
 * @swagger
 *  /login:
 *      post:
 *          description: Returns the homepage
 *          produces: 
 *              - application/json
 *          responses:
 *              200:
 *                  description: hello world
 */
router.post('/login', (req, res) => {
    // let user = new User(req.body.email, req.body.password);

    // TODO: 
    //  1- lookup user and hashed password from mongo db
    //  2- set Bearer JWT header if successful, and return success
    //  3- otherwise, return failure, with no header

    let responsePayload  = {
        access_token: "some token",
        expires_in: 3600,
        scope: "customScope",
        token_type: "Bearer"
    };

    res.json(responsePayload);
})

/**
 * @swagger
 *  /logout:
 *      post:
 *          description: Returns the homepage
 *          produces: 
 *              - application/json
 *          responses:
 *              200:
 *                  description: hello world
 */
router.get('/logout', (req, res) => {
    let loginUrl = getConfig().get("login_url");

    // TODO:
    // 1- return an expired cookie
    // 2- redirect to login

    res.redirect(loginUrl);
})

module.exports = router;