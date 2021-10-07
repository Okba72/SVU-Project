/**
 * 
 */
"use strict";

import express from "express";
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
  // app.use(bodyParser.json({ limit: "50mb" }));
  // app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: false, limit: "50mb" }));

  // setup CORS middleware:
  app.use((req, res, next) => {
    // res.header("Access-Control-Allow-Origin", req.get('origin'));
    // console.log(`>>> method: ${req.method},  ${req.headers.origin}`)
    const proxyHost = req.headers["x-forwarded-host"];
    const host = req.protocol + "://" + (proxyHost ? proxyHost : req.headers.host);
    let reqOrigin = req.headers.origin;
    reqOrigin = reqOrigin ? reqOrigin : host;


    if (appConfig.get("app:security:allow_origin").indexOf(req.headers.origin) !== -1) {
      // console.log(`header origin is in allow list: ${req.headers.origin}`);
      res.header("Access-Control-Allow-Origin", req.headers.origin);
    } else {
      // console.log(`header origin is NOT in allow list: ${req.headers.origin}`);
      // console.log(`restricting allow origin to:  ${appConfig.get("external_server_url")}`);
      res.header("Access-Control-Allow-Origin", appConfig.get("external_server_url"));

      req.headers.origin = reqOrigin;
    }


    // console.log(`req.header("Origin"): ${req.get('origin')}`);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "Authorization");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Accept-Language, Content-Language, Authorization, Access-Control-Allow-Origin");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS",);

    if (req.method === "OPTIONS") {
      // console.log(`>>> OPTIONS method: ${req.headers.origin}`)
      return res.status(200).end();
    }

    next();
  });


  let corsOptions = {
    origin: function (origin, next) {
      // console.log(appConfig.get("app:security:allow_origin"));

      if (appConfig.get("app:security:allow_origin").indexOf(origin) !== -1) {
        // console.log("cors ctrl: ", origin);
        next(null, true);
      } else {
        // console.log(`ERROR:  cors ctrl: not allowed!!: ${origin}`);
        next(new Error('Not allowed by CORS'));
        // next(null, true);
      }

    },
    credentials: true,
    preflightContinue: false,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // ["GET", "POST", "PUT", "PATCH" , "DELETE", "OPTIONS"],

  }
  app.use(cors(corsOptions));

  // setup the request router middleware:
  await AppRouter(app, appConfig);

  // start the server
  let port = appConfig.get("port");

  // creating the API server:
  https.createServer({
    key: fs.readFileSync(path.resolve(appConfig.get("app:ssl:key_file"))),
    cert: fs.readFileSync(path.resolve(appConfig.get("app:ssl:cert_file")))
  }, app)
    .listen(port, function () {
      logger.info((new Date()) + "API Server listening on port: %d", port);
    })

  // init the websocket server:
  await WSConnectionServer.init(appConfig.get("wss_server"), logger);
}

pilot();

