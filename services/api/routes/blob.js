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
import BlobHelper from "../lib/utils/blobHelper";

import ImageHelper from "../lib/utils/imageHelper";

import AppLoggerFactory from "../server/app_logger";
import { findOne, insertOne, updateOne } from "../server/database";

const router = Router();

const appConfig = getConfig();

const run_mode = appConfig.get("NODE_ENV") || "development";

const logger = AppLoggerFactory.getLogger(
    "Blob", run_mode === "production"
    ? "WARN"
    : "DEBUG");

/**
 * This module does not require its endpoint to be secured/protected.
 * 
 */


/**
 * This endpoint will return a blob (shared file) if the form encoded jwt is valid
 * 
 * @swagger
 *  /{token}:
 *    get:
 *      description: Returns the requested file
 *      produces: 
 *        - application/octet-stream
 *      parameters:
 *        - in: path
 *          name: token
 *          required: true
 *          type: string
 *          minimum: 1
 *          description: encrypted token descriptor of the requested file.
 *      responses:
 *        200:
 *          description: the response contains the octet stream of the file.
 */
router.get("/:token", async (req, res) => {

    let token = req.params["token"];

    let fileDescr = CryptoHelper.decryptBlobDownloadDescriptor(token);
    if (!fileDescr) {
      return res.end();
    }

    console.log(fileDescr);
  
    let fileUri = await BlobHelper.readFile(fileDescr.fileUri);

    fileUri = fileUri.replace(/\"/g, "");

    // data:image/png;base64,
    let re = new RegExp("^data:(.*),(.*)$");
    let matches = re.exec(fileUri);

    res.header("Content-Type", matches[1]);
    res.header("X-Content-Type-Options",  "nosniff");

    // console.log(matches[1]);
    // console.log(matches[2]);

    let respBuff = Buffer.from(matches[2], "base64");
    res.send(respBuff);
    res.end();
})



module.exports = router;