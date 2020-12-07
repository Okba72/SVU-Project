
"use strict";

import { server as WebSocketServer } from "websocket";
import fs from "fs";
import path from "path";
import { resolve } from "path";
import { readdir } from "fs/promises";
import https from "https";
import { verify } from "jsonwebtoken";
import url from "url";
import querystring from "querystring";
import get from "lodash/get";
import Ajv from 'ajv';

let connectionCache = {};


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

const WSS_CONFIG_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "WSS Server Config",
    "description": "The config object structure for the WSS server",
    "type": "object",
    "properties": {
        "ssl": {
            "description": "the ssl object defining the file path for the cert and key",
            "type": "object",
            "properties": {
                "cert_file": {
                    "type": "string"
                },
                "key_file": {
                    "type": "string"
                }
            },
            "required": ["cert_file", "key_file"]
        },
        "wss_port": {
            "description": "https used for the base https server",
            "type": "integer",
            "minimum": 1030,
            "maximum": 65535
        },
        "protocols": {
            "description": "the array of protocols accepted by the WSS server",
            "type": "array",
            "items": {
                "type": "string",
                "minLength": 2
            },
            "minItems": 1
        },
        "allow_origins": {
            "description": "the array of origins accepted by the WSS server",
            "type": "array",
            "items": {
                "type": "string",
                "minLength": 2
            },
            "minItems": 1
        },
        "wss_handlers_root": {
            "description": "the relative path to the route folder where the message handlers are",
            "type": "string",
            "minLength": 2
        }
    },
    "required": ["ssl", "wss_port", "protocols", "allow_origins", "wss_handlers_root"],
    "additionalProperties": false
};


/**
 * This is a singleton construct to comprise all the
 * needed functionality for handling WS connection functionality
 * needed for the SVU app.
 */
class WSConnectionServer {
    static clientAddressToUserIdCache = {};
    static userIdToConnectionCache = {};
    static endPointHandlers = {};

    static logger;
    static isInitialized = false;

    constructor() {
    }

    static async init(config, logger) {
        if (this.isInitialized) {
            return;
        }

        let ajv = new Ajv();
        let configIsValid = ajv.validate(WSS_CONFIG_SCHEMA, config);
        if (!configIsValid || !logger) {
            console.log("\n\nlogger not provided or schema validation for WSS server config failed: ", ajv.errors, "\n\n");
            process.exit(1);
        }


        WSConnectionServer.logger = logger;

        let wsPort = get(config, "wss_port", -1);

        const secretKey = fs.readFileSync(path.resolve("./", get(config, "ssl.key_file")));

        // creating the websoket server:
        let httpServerForWS = https.createServer({
            key: fs.readFileSync(path.resolve("./", get(config, "ssl.key_file"))),
            cert: fs.readFileSync(path.resolve("./", get(config, "ssl.cert_file")))
        }, (request, response) => {
            logger.info("Received request for " + request.url);
            response.writeHead(403);
            response.end();
        });
        httpServerForWS.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
        });
        httpServerForWS.listen(wsPort, () => {
            logger.info((new Date()) + "WS Server listening on port: %d", wsPort);
        })


        let wsServer = new WebSocketServer({
            httpServer: httpServerForWS,
            // You should not use autoAcceptConnections for production
            // applications, as it defeats all standard cross-origin protection
            // facilities built into the protocol and the browser.  You should
            // *always* verify the connection's origin and decide whether or not
            // to accept it.
            autoAcceptConnections: false
        });


        // register the handlers in the handler root folder:
        const handlerFiles = await getFiles(path.resolve("./", get(config, "wss_handlers_root")));
        for (let flnm of handlerFiles) {
            let relFn = path.relative("./routes/", flnm);
            let relFnNoExt = relFn.replace(/\.[^/.]+$/, "");
            let moduleHolder = require(flnm);
            WSConnectionServer.endPointHandlers[moduleHolder.getHandledMessageType()] = moduleHolder;
        }

        /**
         * 
         * @param {*} request 
         */
        function getAuthorization(request) {
            try {
                let reqQuery = querystring.parse(url.parse(request.httpRequest.url).query);
                let authToken = reqQuery.token || "";
                let authRe = /Bearer\s+(.*)/;
                let matchFrag = authToken.match(authRe);

                if (!get(config, "allow_origins").includes(request.origin)) {
                    logger.warn(`origin of request: ${request.origin} is forbidden!`);
                    return null;
                }
                if (!matchFrag || matchFrag.length != 2) {
                    logger.warn("authorization token failed verification!!");
                    return null;
                } else {
                    // put logic here to detect whether the client sent authorization:
                    try {
                        let decToken = verify(matchFrag[1], secretKey);
                        console.log(decToken);
                        return decToken;
                    } catch (err) {
                        logger.warn("authorization token failed verification!!");
                        return null;
                    }
                }
            } catch (err) {
                console.log(err);
                return null;
            }
        }

        /**
         * upgradeError handler
         */
        wsServer.on("upgradeError", (error) => {
            console.log(error);
        });

        /**
         * connection request hander
         */
        wsServer.on("request", function (request) {
            let decodedOriginToken = getAuthorization(request);

            if (!decodedOriginToken) {
                // Make sure we only accept requests from an allowed origin (token)
                logger.warn(" Connection from " + request.origin + " rejected.");
                try {
                    request.reject(403);
                } catch (err) {
                    logger.warn(" Connection for token rejected.", err);
                }
                return;
            } else {
                // accept the connection and add it to the cache:
                let userId = decodedOriginToken.sub;
                var connection = request.accept("svu-protocol", request.origin);
                WSConnectionServer.addConnection(userId, connection);
                logger.info(`WSConnection accepteed for ${userId}`);

                /**
                 * 
                 */
                connection.on("message", async function (message) {
                    let error = {
                        status: 500,
                        message: "unrecognizable message type! "
                    };

                    if (message.type === "utf8") {
                        try {
                            let messageUTFPayload = message.utf8Data;
                            let messagePayload = JSON.parse(messageUTFPayload);

                            let messageEndpoint = get(messagePayload, "endPoint", "UNKNOWN");
                            if (messageEndpoint !== "UNKNOWN") {
                                let handler = WSConnectionServer.endPointHandlers[messageEndpoint]
                                if (handler) {
                                    let reply = await handler.handleRequset(messagePayload);
                                    let replyTos = get(reply, "replyTo", []);
                                    for (let clntUser of replyTos) {
                                        WSConnectionServer.notifyClients(clntUser, JSON.stringify(reply, null, 4));
                                    }
                                    let okMsg = {
                                        status: 200,
                                        message: reply
                                    }
                                    connection.sendUTF(JSON.stringify(okMsg, null, 4));
                                } else {
                                    connection.sendUTF(JSON.stringify(error, null, 4));
                                }
                            } else {
                                logger.info("Unrecognizable message! " + messagePayload);
                                connection.sendUTF(JSON.stringify(error, null, 4));
                                return;
                            }
                        } catch (err) {
                            logger.info("error while processing message! " + err);
                            error.message = "error while processing message! " + err;
                            connection.sendUTF(JSON.stringify(error, null, 4));
                            return;
                        }
                    } else {
                        logger.info("unrecognizable message type! ");
                        connection.sendUTF(JSON.stringify(error, null, 4));
                    }
                });

                /**
                 * 
                 */
                connection.on("close", function (reasonCode, description) {
                    let clientAddressRef = WSConnectionServer.addressRefFromConnection(connection);
                    WSConnectionServer.handleConnectionClose(clientAddressRef);
                    logger.info(`Peer ${clientAddressRef} disconnectd for ${reasonCode}: ${description}`);
                });
            }

        });

        WSConnectionServer.isInitialized = true;
    }

    /**
     * 
     * @param {*} connection 
     */
    static addressRefFromConnection(connection) {
        return `${connection.socket.remoteAddress}_${connection.socket.remotePort}`;
    }

    /**
     * 
     * @param {*} userId 
     * @param {*} connection 
     */
    static addConnection(userId, connection) {
        let clientAddressRef = WSConnectionServer.addressRefFromConnection(connection);
        WSConnectionServer.clientAddressToUserIdCache[clientAddressRef] = userId;

        if (!WSConnectionServer.userIdToConnectionCache[userId]) {
            WSConnectionServer.userIdToConnectionCache[userId] = {};
        }

        WSConnectionServer.userIdToConnectionCache[userId][clientAddressRef] = connection;
    }

    /**
     * 
     * @param {*} userId 
     * @param {*} payload 
     */
    static notifyClients(userId, payload) {
        console.log(userId, payload);
        let jsonPayload = JSON.stringify(payload, null, 2);
        for (const addRef in WSConnectionServer.userIdToConnectionCache[userId]) {
            let connection = WSConnectionServer.userIdToConnectionCache[userId][addRef];
            connection.sendUTF(jsonPayload);
        }
    }


    /**
     * 
     * @param {*} clientAddressRef 
     */
    static handleConnectionClose(clientAddressRef) {
        let userId = WSConnectionServer.clientAddressToUserIdCache[clientAddressRef];
        delete WSConnectionServer.clientAddressToUserIdCache[clientAddressRef];
        delete WSConnectionServer.userIdToConnectionCache[userId][clientAddressRef];
    }
}

// setInterval(() => {
//     WSConnectionServer.notifyClients("ali@gaaiat.com", {a: 1, b:2});
// }, 5000);

export default WSConnectionServer;