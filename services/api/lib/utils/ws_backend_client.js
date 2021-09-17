process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { client as WebSocketClient } from "websocket";
import { sign } from "jsonwebtoken";
import { getConfig } from "../../server/config";
import path from "path";
import fs from "fs";
import { URL } from "url";
import AppLoggerFactory from "../../server/app_logger";


const SERVER_SIDE_JWTID = "1234506789";

const appConfig = getConfig();
const secretKey = fs.readFileSync(path.resolve(appConfig.get("app:ssl:key_file")));
const origin = appConfig.get("external_server_url");
const domainUrl = new URL(origin);


const logger = AppLoggerFactory.getLogger(
    "WSSClient", appConfig.get("run_mode") === "production"
    ? "WARN"
    : "DEBUG")

/**
 * swrverside token utility
 */
const getToken = (userId) => {
    let expireTimeMillis = (new Date()).getTime() + 3600000;
    let responsePayload = {
        scope: "SVU",
        token_type: "JWT",
        expireTimeMillis: expireTimeMillis,
    };


    const opts = {
        expiresIn: 3600,
        audience: domainUrl.hostname,
        issuer: domainUrl.hostname,
        subject: userId,
        jwtid: SERVER_SIDE_JWTID,
    };

    const token = sign(responsePayload, secretKey, opts);

    return token;
}

const sendMessage = (wssServerUrl, payload) => {
    const client = new WebSocketClient();
    //TODO: This can be further optimized to re-use tokens until they are about to expire.
    const token = getToken("svu-api-server");

    return new Promise((resolve, reject) => {
        client.on("connectFailed", function (error) {
            logger.warn(`WSSClient connect Error:  ${error.toString()}`);
            reject(error.toString());
        });

        client.on("connect", function (connection) {
            logger.info("WSSClient Connected");
            connection.on("error", function (error) {
                logger.warn("Connection Error: " + error.toString());
                reject(error.toString());
            });
            connection.on("close", function () {
                logger.info("server-side svu-protocol connection closed");
            });
            connection.on("message", function (message) {
                let messageObj = {};
                try {
                    if (message.type === "utf8") {
                        // logger.info("WSSClient received: " + message.utf8Data);
                        messageObj = JSON.parse(message.utf8Data);
                    } else {
                        logger.warn("WSSClient received unrecongizable (non UTF8) message! ");
                    }
                    resolve(messageObj);
                } catch (error) {
                    reject(error);
                }
            });

            if (connection.connected) {
                connection.sendUTF(JSON.stringify(payload, null, 4));
            } else {
                logger.warn("WSSClient disconnected before opportunity to send message")
                reject(new Error("WSSClient disconnected before opportunity to send message"));
            }
        });

        client.connect(`${wssServerUrl}?token=Bearer ${token}`, "svu-protocol", origin);
    });
}




export {
    sendMessage
};