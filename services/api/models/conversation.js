/**
 * 
 */
"use strict";

/**
 * @swagger 
 * 
 * definitions:
 *   Conversation:
 *     type: object
 *     required:
 *       - userList
 *       - msgList
 *     properties:
 *       userList:
 *         type: string
 *       msgList:
 *         type: string
 */
class Conversation {
    constructor(userList, msgList) {
        this.userList = userList;
        this.msgList = msgList;
        this.dateLastUpdated = Date.now();
    }
}

export default Conversation;