/**
 * 
 */

"use strict";
import { getConfig } from "../../server/config";
import path from "path";
import fs from "fs";
import { resolve } from "path";
import { readdir } from "fs/promises";


/**
 * 
 * @param {*} dir 
 */




class ImageHelper {

    /**
     * 
     * @param {*} appConfig 
     */
    constructor(appConfig) {
        // const secretKey = fs.readFileSync(appConfig.get("app:ssl:key_file"));
        // this.key = config.get()
    }

    static async getPngFiles(dir) {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFiles(res) : res;
        }));

        let pngFiles = files.filter((file) => {
            return path.extname(file) == ".png";
        })
        return Array.prototype.concat(...pngFiles);
    }

    /**
     * 
     * @param {*} imagePath 
     */
    static getImageAsBase64(imagePath) {
        let imgBin = fs.readFileSync(imagePath);
        // convert binary data to base64 encoded string
        return new Buffer.from(imgBin).toString('base64');
    }


    static getRndImageAsBase64(imgResPath) {
        let imgBin = fs.readFileSync(imagePath);
        // convert binary data to base64 encoded string
        return new Buffer.from(imgBin).toString('base64');
    }

}

export default ImageHelper;