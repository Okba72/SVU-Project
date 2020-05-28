/**
 * 
 */

"use strict";
import crypto from "crypto";

class HashUtils {

    /**
     * 
     * @param {*} config 
     */
    constructor(config) {

    }

    /**
     * generates random string of characters to be used as salt
     * @param {*} length 
     */
    static genRandomString(length) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString("hex") /** convert to hexadecimal format */
            .slice(0, length);   /** return required number of characters */
    };


    /**
     * hash password using sha512.
     * 
     * @param {string} password 
     */
    static genPasswordHash(password) {
        let salt = HashUtils.genRandomString(16);
        let hash = crypto.createHmac("sha512", salt); 
        hash.update(password);
        let value = hash.digest("hex");
        return value + ":" + salt;
    };


    /**
     * 
     * @param {*} password 
     * @param {*} salt 
     */
    static validatePassword(password, passwordHash) {
        let [expectedValue, salt] = passwordHash.split(":");

        let hash = crypto.createHmac("sha512", salt); 
        hash.update(password);
        let value = hash.digest("hex");
        return value == expectedValue;
    };

}

export default HashUtils;