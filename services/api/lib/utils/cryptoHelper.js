/**
 * 
 */

"use strict";
import crypto from "crypto";
import { getConfig } from "../../server/config";
import path from "path";
import fs from "fs";

class CryptoHelper {

    /**
     * 
     * @param {*} appConfig 
     */
    constructor(appConfig) {
        this.secretKey = fs.readFileSync(path.resolve(appConfig.get("app:ssl:key_file"))).toString("utf8");
    }


    /**
     * 
     * @param {*} email 
     */
    validateEmail(email) {
        const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    }


    /**
     * generates random string of characters to be used as salt
     * @param {*} length 
     */
    genRandomString(length) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString("hex") /** convert to hexadecimal format */
            .slice(0, length);   /** return required number of characters */
    };


    /**
     * hash password using sha512.
     * 
     * @param {string} password 
     */
    genPasswordHash(password) {
        let salt = this.genRandomString(16);
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
    validatePassword(password, passwordHash) {
        let [expectedValue, salt] = passwordHash.split(":");

        let hash = crypto.createHmac("sha512", salt); 
        hash.update(password);
        let value = hash.digest("hex");
        return value == expectedValue;
    };


    /**
     * 
     * @param {*} userId 
     * @param {*} narText 
     */
    ecnryptNaRAttributes(userId, narText) {
        // let cipher = crypto.createCipheriv("aes-256-cbc", this.secretKey, this.iv);

        // let cipherText = "";
        // cipherText += cipher.update(userId.concat(":", narText), "utf8", "hex");
        // cipherText += cipher.final("hex");

        let clearBuff = Buffer.from(userId.concat(":", narText), "utf8");
        let cipherBuff = crypto.publicEncrypt(this.secretKey, clearBuff);

        return cipherBuff.toString("base64");
    }

    /**
     * 
     * @param {*} narToken 
     */
    decryptNaRToken(narToken) {

        let cipherBuff = Buffer.from(narToken, "base64");
        let clearBuff = crypto.privateDecrypt(this.secretKey, cipherBuff);

        return clearBuff.toString("utf8");


        // let decipher = crypto.createDecipher("aes-256-cbc", this.secretKey);
        // let clearText = "";
        // clearText += decipher.update(userId.concat(":", narText), "hex", "utf8");
        // clearText += decipher.final("utf8");

        // return clearText;
    }
}

export default new CryptoHelper(getConfig());