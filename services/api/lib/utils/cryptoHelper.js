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

    /**
     * 
     * @param {*} userId 
     * @param {*} narText 
     */
    ecnryptMessageFileURI(fileUri) {
        // Use the async `crypto.scrypt()` instead.

        // console.log(`fileUri: ${fileUri}`);

        const key = crypto.scryptSync(this.secretKey, this.genRandomString(24), 24);
        const iv = Buffer.alloc(16, 0); // Initialization vector.
        // const iv = crypto.randomBytes(16); // Initialization vector.
        const cipher = crypto.createCipheriv("aes192", key, iv);

        // console.log(`enc key is: ${key}`);
        let cipherText = cipher.update(fileUri, "utf8", "base64");
        cipherText += cipher.final("base64");
        // console.log(cipherText);

        let hash = crypto.createHmac("sha256", "salt");
        hash.update(fileUri);
        let encryptedFileIUriHash = hash.digest("hex");

        cipherText = crypto.publicEncrypt(this.secretKey, key).toString("base64") + ":" + cipherText;
        let retObj = {
            encryptedFileIUri: cipherText,
            encryptedFileIUriHash: encryptedFileIUriHash,
        }

        // console.log(cipherText);

        return retObj;
    }

    /**
     * 
     * @param {*} narToken 
     */
    decryptMessageFileURI(encryptedFileUri) {

        // console.log(`\n\n type of encryptedFileUri = ${typeof (encryptedFileUri)} \n\n`)
        let encParts = encryptedFileUri.split(":");
        // console.log(`\n\n type of encParts = ${typeof (encParts)} \n\n`)
        // console.log(`encParts = ${encParts}`)

        let encFileUri = encParts[1];
        // console.log(`\n\n encFileUri = ${encFileUri} \n\n`)
        // console.log(`\n\n encKey = ${encParts[0]} \n\n`)

        let encKey = Buffer.from(encParts[0], "base64");
        let key = crypto.privateDecrypt(this.secretKey, encKey);
        // console.log(`\n\n type of encParts = ${typeof (encParts)} \n\n`)

        // console.log(`dec key is: ${key}`);

        const algorithm = 'aes192';
        const iv = Buffer.alloc(16, 0); // Initialization vector.
        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        // Encrypted using same algorithm, key and iv.
        let clearFileUri = decipher.update(encFileUri, "base64", "utf8");
        clearFileUri += decipher.final("utf8");

        return clearFileUri;
    }

}

export default new CryptoHelper(getConfig());