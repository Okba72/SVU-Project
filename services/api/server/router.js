/**
 * 
 */
"use strict";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import path from "path";
import fs from "fs";
import { resolve } from "path";
import { readdir } from "fs/promises";

import { OpenApiValidator } from "express-openapi-validate";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import get from "lodash-es/get";

import HashUtils from "../lib/utils/hashUtils";


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const refresshJWT = (req, res, next) => {
  console.log("refreshing jwt ....");
  next();
}

/**
 * 
 * @param {*} app 
 * @param {*} appConfig 
 */
const mountSecurityModule = (app, appConfig) => {
  console.log("mounting passport middleware ...");

  let opts = {}
  const secretKey = fs.readFileSync(path.resolve("./config", appConfig.get("app:ssl:key_file")));
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  // opts.jwtFromRequest = ExtractJwt.fromHeader("svuauth");
  opts.secretOrKey = secretKey;
  opts.issuer = "localhost";
  opts.audience = "localhost";


  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    console.log(jwt_payload);
    return done(null, { id: jwt_payload.sub });


    // User.findOne({ id: jwt_payload.sub }, function (err, user) {
    //     if (err) {
    //         return done(err, false);
    //     }
    //     if (user) {
    //         return done(null, user);
    //     } else {
    //         return done(null, false);
    //         // or you could create a new account
    //     }
    // });
  }));

}


/**
 * 
 * @param {*} dir 
 */
async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

let swaggerSpec;

let endPointHandlers = {};


/**
 * 
 * @param {*} app 
 * @param {*} config 
 * @param {*} modelRelPath 
 */
const __registerModel = (app, config, modelRelPath) => {
  const appRoot = config.get("app_root");
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: config.get("app_title"),
        version: config.get("app_version"),
      },
    },
    // Path to the API docs
    apis: ["./models/" + modelRelPath + ".js"],
  };

  let tempSwagSpec = swaggerJSDoc(options);
  let tempPaths = {};

  if (!swaggerSpec) {
    swaggerSpec = tempSwagSpec;
  } else {
    Object.assign(swaggerSpec.definitions, tempSwagSpec.definitions);
    Object.assign(swaggerSpec.components, tempSwagSpec.components);
  }

}


/**
 * 
 * @param {*} app 
 * @param {*} config 
 * @param {*} routeRelPath 
 * @param {*} routeModule 
 */
const __registerRoute = (app, config, routeRelPath, routeModule) => {
  const appRoot = config.get("app_root");
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: config.get("app_title"),
        version: config.get("app_version"),
      },
    },
    // Path to the API docs
    apis: ["./routes/" + routeRelPath + ".js"],
  };

  let tempSwagSpec = swaggerJSDoc(options);

  let tempPaths = {};
  for (let [key, value] of Object.entries(tempSwagSpec["paths"])) {
    let tempStr = "/" + routeRelPath;
    if (key.startsWith("/")) {
      tempStr += key;
    } else {
      tempStr += "/" + key;
    }
    tempPaths[tempStr] = value;
  }
  tempSwagSpec.paths = tempPaths;

  if (!swaggerSpec) {
    swaggerSpec = tempSwagSpec;
  } else {
    Object.assign(swaggerSpec.paths, tempPaths);
  }

  let secureModule = false;
  if (get(tempSwagSpec, "components.securitySchemes.bearerAuth")) {
    secureModule = true;
  }

  endPointHandlers[appRoot + "/" + routeRelPath] = { secureModule: secureModule, module: routeModule };
}

/**
 * 
 * @param {*} app 
 * @param {*} config 
 */
const AppRouter = async (app, config) => {
  mountSecurityModule(app, config);

  const appRoot = config.get("app_root");

  const modelFiles = await getFiles("./models/");
  for (let flnm of modelFiles) {
    let relFn = path.relative("./models/", flnm);
    let relFnNoExt = relFn.replace(/\.[^/.]+$/, "");
    __registerModel(app, config, relFnNoExt);
  }


  const routeFiles = await getFiles("./routes/");
  for (let flnm of routeFiles) {
    let relFn = path.relative("./routes/", flnm);
    let relFnNoExt = relFn.replace(/\.[^/.]+$/, "");
    let module_holder = require(flnm);

    __registerRoute(app, config, relFnNoExt, module_holder);
  }

  const validator = new OpenApiValidator(swaggerSpec);
  app.use(validator.match());

  for (let [key, value] of Object.entries(endPointHandlers)) {
    if (value.secureModule) {
      app.use(key, passport.authenticate("jwt", { session: false }), value.module);
    } else {
      app.use(key, value.module);
    }

  }
  console.log(swaggerSpec);

  swaggerSpec.servers = [{ url: "/svu/api" }]
  app.use(appRoot + "/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


  // refresh JWT if a valid one is present:
  app.use(refresshJWT);

  // default route:
  app.use((req, res) => {
    res.sendStatus(404);
  });
}

export default AppRouter;