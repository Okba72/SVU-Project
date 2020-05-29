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




/* GET home page. */
router.get("/", (req, res, next) => {
    let staff = [
        {
            name: "Anna"
        },
        {
            name: "Julia"
        },
        {
            name: "Erika"
        }
    ];
    res.json(staff);
});

router.get("/:userId", (req, res, next) => {
    let userId = req.params.userId;
    let staff =
    {
        name: userId
    };
    res.json(staff);
});

module.exports = router;
