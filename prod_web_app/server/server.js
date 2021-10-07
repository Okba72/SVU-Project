/**
 * 
 */
"use strict";

import express from "express";
import nconf from "nconf";

import * as configService from "./config";
import AppLoggerFactory from "./app_logger";


import fs from "fs";
import path from "path";
import https from "https";

let pilot = async () => {
  let app = express();

  //let appRoot = path.resolve(".");
  //    let appRoot = path.dirname(require.main.filename);
  const run_mode = nconf.get("NODE_ENV") || "development";

  let logger = AppLoggerFactory.getLogger(
    "APPConfig", run_mode === "production"
    ? "WARN"
    : "DEBUG");

  logger.info("Running in %s mode", run_mode);

  process.on('uncaughtException', function (err) {
    logger.error(err.stack + " - Server continuing ...");
    // logger.error("Server continuing after error ...");
  });

  configService.init(".");
  let appConfig = configService.getConfig();


  ///////////////////// middleware:   ////////////////////////////////
  //

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb" }));
  
  //serve static app
  app.use("/svu/app", express.static("../SVU/web-build"))

  // start the server
  let port = appConfig.get("port");

  // creating the API server:
  https.createServer({
    key: fs.readFileSync(path.resolve(appConfig.get("app:ssl:key_file"))),
    cert: fs.readFileSync(path.resolve(appConfig.get("app:ssl:cert_file")))
  }, app)
    .listen(port, function () {
      logger.info((new Date()) + "Web Server listening on port: %d", port);
    })
}

pilot();

