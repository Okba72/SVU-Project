/**
 * 
 */
"use strict";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import path from "path";
import { resolve } from 'path';
import { readdir } from 'fs/promises';

import HashUtils from "../lib/utils/hashUtils";

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

  app.use(appRoot + "/" + routeRelPath, routeModule);
}

/**
 * 
 * @param {*} app 
 * @param {*} config 
 */
const AppRouter = async (app, config) => {
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

  console.log(swaggerSpec);

  swaggerSpec.servers = [{ url: "/svu/api" }]
  app.use(appRoot + "/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default AppRouter;