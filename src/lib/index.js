// @flow

import got from "got";
import fs from "fs-extra";
import md5 from "md5";
import md5File from "md5-file/promise";
import FormData from "form-data";
import { URL } from "url";
import { promisify } from "bluebird";
import type { Response } from "got";
import type { PreparedUpload } from "../types/";

class Rapidgator {
    sid: string;
    login: string;
    password: string;

    constructor(options: { login: string, password: string }) {
        if (!options) {
            throw new Error("You did not specify options");
        }

        if (!options.login) {
            throw new Error("You did not specify login");
        }

        if (!options.password) {
            throw new Error("You did not specify password");
        }

        this.login = options.login;
        this.password = options.password;
        this.sid = "";
    }

    async logIn(): Promise<void> {
        const response: Response = await got("http://rapidgator.net/api/user/login", {
            query: {
                "username": this.login,
                "password": this.password
            }
        });

        const result: Object = JSON.parse(response.body);

        this.sid = result.response.session_id;
    }

    async _prepareUpload(options: { filePath?: string, buffer?: Buffer, name: string, folderID?: number }): Promise<PreparedUpload> {
        const filePath: ?string = options.filePath;
        const buffer: ?Buffer = options.buffer;
        const name: string = options.name;
        const folderID: ?number = options.folderID;
        
        let hash: string = "";
        let size: number = 0;

        if (filePath) {
            hash = await md5File(filePath);
            size = fs.statSync(filePath).size;
        }
        else if (buffer) {
            hash = md5(buffer);
            size = buffer.byteLength;
        }

        const query: Object = {
            "sid": this.sid,
            "hash": hash,
            "size": size,
            "name": name
        };

        if (folderID) {
            query["folder_id"] = folderID;
        }

        const response: Response = await got("http://rapidgator.net/api/file/dupload", {
            query: query
        });

        const result: Object = JSON.parse(response.body);

        if (result.response.link) {
            return {
                alreadyUploaded: true,
                url: unescape(result.response.link)
            };
        }

        return {
            alreadyUploaded: false,
            url: unescape(result.response.url)
        };
    }

    async _getUploadedFile(uploadID: string): Promise<string> {
        const response: Response = await got("http://rapidgator.net/api/file/dupload_info", {
            query: {
                "sid": this.sid,
                "uuid": uploadID
            }
        });

        const result: Object = JSON.parse(response.body);

        const fileURL: string = unescape(result.response.link);

        return fileURL;
    }

    async upload(options: { name: string, buffer?: Buffer, filePath?: string, folderID?: number }): Promise<string> {
        if (!options) {
            throw new Error("You did not specify options");
        }

        if (!options.name) {
            throw new Error("You did not specify name");
        }

        if (!options.buffer && !options.filePath) {
            throw new Error("You did not specify buffer or filePath");
        }

        if (!this.sid) {
            throw new Error("You are not logged in");
        }

        const name: string = options.name;
        const buffer: ?Buffer = options.buffer;
        const filePath: ?string = options.filePath;
        options.folderID = 1;

        const preparedUpload: PreparedUpload = await this._prepareUpload(options);
        
        if (preparedUpload.alreadyUploaded) {
            return preparedUpload.url;
        }

        const uploadURL: URL = new URL(preparedUpload.url);
        const uploadID: string = uploadURL.searchParams.get("uuid") || "";

        const form: FormData = new FormData();

        if (filePath) {
            form.append("file", fs.createReadStream(filePath), {
                filename: name,
                knownLength: fs.statSync(filePath).size
            });
        }
        else if (buffer) {
            form.append("file", buffer, {
                filename: name,
                knownLength: buffer.byteLength
            });
        }

        const formLength: number = await promisify(form.getLength).bind(form)();

        await got(uploadURL, {
            body: form,
            headers: {
                "content-length": formLength
            }
        });

        const uploadInfo: string = await this._getUploadedFile(uploadID);

        return uploadInfo;
    }
}

export default Rapidgator;