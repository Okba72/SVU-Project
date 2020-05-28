/**
 * 
 */
"use strict";

/**
 * @swagger 
 * 
 * definitions:
 *   Message:
 *     type: object
 *     required:
 *       - fromUser
 *       - toUser
 *       - msgText
 *     properties:
 *       fromUser:
 *         type: string
 *       toUser:
 *         type: string
 *       msgText:
 *         type: string
 */
class Message {
    constructor(fromUser, toUser, msgText) {
        this.fromUser = fromUser;
        this.toUser = toUser
        this.msgText = msgText;
    }
}

export default Message;