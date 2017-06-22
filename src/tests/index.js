// @flow

import { expect } from "chai";
import randomBuffer from "random-buffer";
import fs from "fs-extra";
import Rapidgator from "../lib/";

const login: string = process.env.LOGIN || "";
const password: string = process.env.PASSWORD || "";

const rapidgator = new Rapidgator({
    login: login,
    password: password
});

describe("Rapidgator API", () => {
    it("Should successfully log in to rapidgator", async () => {
        await rapidgator.logIn();

        expect(rapidgator.sid.length).to.be.above(0);
    });

    const shouldUploadByBuffer: Object = it("Should upload a file by buffer to rapidgator", async () => {
        shouldUploadByBuffer.timeout(20000);

        const fileURL: string = await rapidgator.upload({
            name: "file.test.random",
            buffer: randomBuffer(450000)
        });

        expect(fileURL).to.not.be.empty;
    });

    const shouldUploadByFilepath: Object = it("Should upload a file by filePath to rapidgator", async () => {
        shouldUploadByFilepath.timeout(20000);

        const filePath: string = "/tmp/file.test.random";

        await fs.writeFile(filePath, randomBuffer(450000));

        const fileURL: string = await rapidgator.upload({
            name: "file.test.random",
            filePath: filePath
        });
        
        expect(fileURL).to.not.be.empty;
    });
});