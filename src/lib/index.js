import got from "got";
import md5 from "md5";
import FormData from "form-data";
import { URL } from "url";
import { promisify } from "bluebird";

class Rapidgator {
    constructor(options) {
        if(!options) {
            throw new Error("You did not specify options");
        }

        if(!options.login) {
            throw new Error("You did not specify login");
        }

        if(!options.password) {
            throw new Error("You did not specify password");
        }

        this.login = options.login;
        this.password = options.password;
        this.sid = "";
    }

    async logIn() {
        const response = await got("http://rapidgator.net/api/user/login", {
            query: {
                "username": this.login,
                "password": this.password
            }
        });

        const result = JSON.parse(response.body);

        this.sid = result.response.session_id;
    }

    async _prepareUpload(name, buffer, folderID) {
        const query = {
            "sid": this.sid,
            "hash": md5(buffer),
            "size": buffer.byteLength,
            "name": name
        };

        if(folderID) {
            query.folder_id = folderID;
        }

        const response = await got("http://rapidgator.net/api/file/dupload", {
            query: query
        });

        const result = JSON.parse(response.body);

        if(result.response.link) {
            return {
                alreadyUploaded: true,
                url: unescape(result.response.link)
            };
        }

        return {
            alreadyExists: false,
            url: unescape(result.response.url)
        };
    }

    async _getUploadedFile(uploadID) {
        const response = await got("http://rapidgator.net/api/file/dupload_info", {
            query: {
                "sid": this.sid,
                "uuid": uploadID
            }
        });

        const result = JSON.parse(response.body);

        const fileURL = unescape(result.response.link);

        return fileURL;
    }

    async upload(options) {
        if(!options) {
            throw new Error("You did not specify options");
        }

        if(!options.name) {
            throw new Error("You did not specify name");
        }

        if(!options.buffer) {
            throw new Error("You did not specify buffer");
        }

        if(!this.sid) {
            throw new Error("You are not logged in");
        }

        const name = options.name;
        const buffer = options.buffer;
        const folderID = options.folderID;

        const preparedUpload = await this._prepareUpload(name, buffer, folderID);
        
        if(preparedUpload.alreadyUploaded) {
            return preparedUpload.url;
        }

        const uploadURL = new URL(preparedUpload.url);
        const uploadID = uploadURL.searchParams.get("uuid");

        const form = new FormData();

        form.append("file", buffer, {
            filename: name,
            knownLength: buffer.byteLength
        });

        const formLength = await promisify(form.getLength).bind(form)();

        await got(uploadURL, {
            body: form,
            headers: {
                "content-length": formLength
            }
        });

        const uploadInfo = await this._getUploadedFile(uploadID);

        return uploadInfo;
    }
}

export default Rapidgator;