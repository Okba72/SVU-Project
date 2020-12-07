/**
 * 
 */
"use strict";

import express from "express";
import bodyParser from "body-parser";
import nconf from "nconf";

import * as configService from "./config";
import AppRouter from "./router";
import AppLoggerFactory from "./app_logger";

import { init as dbInit } from "./database";
import WSConnectionServer from "./ws_server";

import cors from "cors";

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

  // initialize the database:
  await dbInit(appConfig, logger);

  ///////////////////// middleware:   ////////////////////////////////
  //
  // setup bodyParser middlewae to parse the body
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  console.log(`\n\n\n Access-Control-Allow-Origin": ${appConfig.get("app:security:allow_origin")} \n\n\n`);
  // setup CORS middleware:
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", appConfig.get("app:security:allow_origin"));
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "Authorization");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Accept-Language, Content-Language, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE",);
    next();
  });

  //the following is needed to enable the browser's pre-flight cors check:
  const corsOptions = {
    origin: appConfig.get("app:security:allow_origin"),
  }
  app.options('*', cors(corsOptions));

  // setup the request router middleware:
  await AppRouter(app, appConfig);

  // start the server
  let port = appConfig.get("port");

  // creating the API server:
  https.createServer({
    key: fs.readFileSync(path.resolve("./config", appConfig.get("app:ssl:key_file"))),
    cert: fs.readFileSync(path.resolve("./config", appConfig.get("app:ssl:cert_file")))
  }, app)
    .listen(port, function () {
      logger.info((new Date()) + "API Server listening on port: %d", port);
    })

  // init the websocket server:
  await WSConnectionServer.init(appConfig.get("wss_server"), logger);
}

pilot();

