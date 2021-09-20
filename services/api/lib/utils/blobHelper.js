import { promises as asyncfs } from "fs";
import fs from "fs";
import path from "path";
import { getConfig } from "../../server/config";
import CryptoHelper from "./cryptoHelper";

class BlobHelper {

    /**
     * 
     * @param {*} appConfig 
     */
    constructor(appConfig) {
        this.secretKey = fs.readFileSync(path.resolve(appConfig.get("app:ssl:key_file"))).toString("utf8");
        this.blob_storage_root = path.resolve(appConfig.get("app:blob_storage:path"));
    }

    /**
     * 
     * @param {*} fileUri 
     * @returns 
     */
    async writeFile(fileUri) {
        let cryptoObj = CryptoHelper.ecnryptMessageFileURI(fileUri);

        // console.log(`\n\n type of cryptoObj.encryptedFileIUriHash: ${typeof (cryptoObj.encryptedFileIUriHash)}\n\n`);
        let dirOne = cryptoObj.encryptedFileIUriHash.substring(0, 2);
        let dirTwo = cryptoObj.encryptedFileIUriHash.substring(2, 4);
        let newFileBlobPath = path.resolve(this.blob_storage_root, dirOne, dirTwo);

        await asyncfs.mkdir(newFileBlobPath, { recursive: true });
        await asyncfs.writeFile(path.resolve(newFileBlobPath, cryptoObj.encryptedFileIUriHash), cryptoObj.encryptedFileIUri, 'utf8');

        return cryptoObj.encryptedFileIUriHash;
    }

    /**
     * 
     * @param {*} fileHash 
     * @returns 
     */
    async readFile(fileHash) {
        let dirOne = fileHash.substring(0, 2);
        let dirTwo = fileHash.substring(2, 4);
        let newFileBlobPath = path.resolve(this.blob_storage_root, dirOne, dirTwo);

        let encFileUri = await asyncfs.readFile(path.resolve(newFileBlobPath, fileHash), 'utf8');

        let fileUri = CryptoHelper.decryptMessageFileURI(encFileUri);

        // console.log(`dec fileUri: ${fileUri}`);

        return fileUri;
    }

}


export default new BlobHelper(getConfig());