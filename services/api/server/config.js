/**
 * 
 */
"use strict";

import AppLoggerFactory from "./appLogger";

import nconf from "nconf";

import os from "os";
import path from "path";


let logger;

/**
 * initialization
 */
let config_initialized = false;

/**
 * [init description]
 * @param  {[type]} config_directory [description]
 * @return {[type]}                  [description]
 */
const init = (application_root_folder) => {
    application_root_folder = path.resolve(application_root_folder || path.dirname(require.main.filename));

    let config_folder_path = path.join(application_root_folder, "config");

    console.log("**** " + config_folder_path);

    nconf
        .env()
        .argv();
    let run_mode = nconf.get("NODE_ENV") || "development";
    let deploy_mode = nconf.get("DEPLOY_MODE") || "development";

    //nconf.defaults({env: {"development": "development", "env": "development"}, NODE_ENV: "development"});

    if (run_mode === "development") {
        nconf.file("development", path.join(config_folder_path, "/development.json"));
        nconf.set("env:development", "development");
        nconf.set("env:env", "development");
    } else if (run_mode === "production") {
        if (deploy_mode === "staging") {
            nconf.file("staging", path.join(config_folder_path, "staging.json"));
            nconf.set("env:staging", "staging");
            nconf.set("env:env", "staging");
        } else {
            deploy_mode = "production";
            nconf.set("env:production", "production");
            nconf.set("env:env", "production");
        }

        nconf.set("env:development", null);
    }

    nconf.file("live", path.join(config_folder_path, "config.json"));

    /**
     *
     */

    logger = AppLoggerFactory.getLogger(
        "APPConfig", run_mode === "production"
        ? "WARN"
        : "DEBUG");

    logger.info("APP configuration init in progress ....");

    let liveEmulation = nconf.get("LIVE_EMULATION") || "";
    liveEmulation = (liveEmulation == "true");
    nconf.set("liveEmulation", liveEmulation);

    logger.info("APP run_mode is: " + run_mode + " APP deploy_mode is: " + deploy_mode);
    nconf.set("run_mode", run_mode);
    nconf.set("env:" + run_mode, run_mode);
    nconf.set("deploy_mode", deploy_mode);
    nconf.set("env:" + deploy_mode, deploy_mode);

    nconf.set("hostname", os.hostname());
    nconf.set("application_root_folder", application_root_folder);

    // if (nconf.get("env:development")) {
    //     logger.info("Backing stage hostname: ", nconf.get("topos:host"));
    // }

    config_initialized = true;
    logger.info("APP configuration init completed.");

};

/**
 *
 * @returns {{}}
 */
const getConfig = () => {
    if (!config_initialized) {
        throw new Error("APPConfig is not yet initialized!");
    } else {
        return nconf;
    }
};

export {
    init,
    getConfig
};