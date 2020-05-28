/**
 * Created by aismael on 11/20/13.
 */

"use strict";

import winston from "winston";
import nconf from "nconf";

import moment from "moment";
import fs from 'fs';
import path from "path";


const { combine, timestamp, label, prettyPrint, printf, splat, colorize } = winston.format;


const logger_map = {};
//let appRoot = path.resolve(".");
//    let appRoot = path.dirname(require.main.filename);
const run_mode = nconf.get("NODE_ENV") || "development";

let logger_config_file = null;

try {
    let temp_logger_config_file = path.join(path.dirname(require.main.filename), "config/logger_config.json");
    let loggerConfFileStats = fs.statSync(temp_logger_config_file);

    if (loggerConfFileStats.isFile()) {
        logger_config_file = temp_logger_config_file;
    }
} catch (err) {
    console.error(err);
}

if (!logger_config_file) {
    try {
        let temp_logger_config_file = "../config/logger_config.json";
        let loggerConfFileStats = fs.statSync(temp_logger_config_file);

        if (loggerConfFileStats.isFile()) {
            logger_config_file = temp_logger_config_file;
        }
    } catch (err) {
        console.error(err);
    }
}

const winstonConfig = winston.config.npm;

winston.addColors(winston.config.npm.colors);

let loggerContainer = new (winston.Container)();

let loggerConfig = {
    "logFile": "logs/app.log",
    "maxLogFileSize": 20480000,
    "backups": 3,
    "globalLogLevel": "info",
    "configurationRefreshPeriodMinutes": 1,
    "loggers": []
};


const appLoggerFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


const AppLoggerFactory = Object.create(Object.prototype, {
    getLogger: {
        enumerable: false,
        configurable: false,
        value: (loggerName, logLevel) => {

            let logger;
            if (logger_map[loggerName]) {
                logger = logger_map[loggerName];
            } else {
                logLevel = logLevel || "warn";
                logLevel = logLevel.toLowerCase();

                if (winstonConfig.levels[logLevel] < winstonConfig.levels[loggerConfig.globalLogLevel]) {
                    logLevel = loggerConfig.globalLogLevel;
                }

                loggerName = loggerName || "APP_WebApp";

                logger = loggerContainer.add(loggerName, {
                    format: combine(
                        label({ label: loggerName }),
                        colorize(),
                        splat(),

                        timestamp(),
                        appLoggerFormat
                        // timestamp(),
                        // prettyPrint()
                    ),
                    transports: [
                        new winston.transports.Console(
                            {
                                level: logLevel,
                                silent: !(run_mode === "development"),
                                label: loggerName,
                                timestamp: () => {
                                    //TODO: implement check on config file for dynamic config capability by piggy-back on timestamp
                                    return new moment().format();
                                },
                                prettyPrint: true,
                                showLevel: true,
                                colorize: "all"
                            }
                        ),
                        new winston.transports.File(
                            {
                                filename: "./logs/app.log",
                                timestamp: () => {
                                    return new moment().format();
                                },
                                prettyPrint: true,
                                showLevel: true,
                                level: logLevel,
                                label: loggerName,
                                colorize: false,
                                json: false,
                                zippedArchive: true,
                                maxFiles: loggerConfig.backups,
                                maxsize: loggerConfig.maxLogFileSize
                            }
                        )
                    ]
                });

                logger.setLevels(winstonConfig.levels);
                logger_map[loggerName] = logger;
            }
            return logger;
        }
    }
});

try {
    if (logger_config_file) {
        //configure the container
        let logConfigStr = fs.readFileSync(logger_config_file, { encoding: "utf8" });

        loggerConfig = JSON.parse(logConfigStr);
        loggerConfig.globalLogLevel = loggerConfig.globalLogLevel.toLowerCase();
        if (!winstonConfig.levels[loggerConfig.globalLogLevel]) {
            loggerConfig.globalLogLevel = "info";
        }

        loggerConfig.loggers.forEach((entry) => {
            AppLoggerFactory.getLogger(entry.loggerName, entry.logLevel);
        });
    }
} catch (err) {
    console.warn(">>> loger configuration file: " + logger_config_file + " not found, or corrupted!", err.message);
}

export default AppLoggerFactory;