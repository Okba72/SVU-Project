/**
 * 
 */
"use strict";

/**
 * @swagger 
 * 
 * definitions:
 *   File:
 *     type: object
 *     required:
 *       - path
 *       - fromUser
 *       - toUser
 *     properties:
 *       fromUser:
 *         type: string
 *       toUser:
 *         type: string

 *       path:
 *         type: string
 */
class File {
    constructor(fromUser, toUser, path) {
        this.path = path;
        this.fromUser = fromUser;
        this.toUser = toUser

    }
}

export default File;