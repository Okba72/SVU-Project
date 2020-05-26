'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import nconf from "nconf";

import SVURouter from '../routes/router';
import { AppLoggerFactory } from "./app_logger";
import * as configService from "./config";
import { config } from 'winston';

let app = express();

//let appRoot = path.resolve(".");
//    let appRoot = path.dirname(require.main.filename);
const run_mode = nconf.get("NODE_ENV") || "development";

let logger = AppLoggerFactory.getLogger(
  "APPConfig", run_mode === "production"
  ? "WARN"
  : "DEBUG");

logger.info("Running in %s mode", run_mode);

configService.init(".");
let appConfig = configService.getConfig();



// setup bodyParser to parse the body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setup CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

// get the routes
SVURouter(app, appConfig);

// start the server
let port = appConfig.get("port");
app.listen(port);

logger.info('Listening on port: %d', port);