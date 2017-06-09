import { expect } from "chai";
import randomBuffer from "random-buffer";
import fs from "fs-extra";
import Rapidgator from "../lib/";

const rapidgator = new Rapidgator({
    login: process.env.LOGIN,
    password: process.env.PASSWORD
});

describe("Rapidgator API", () => {
    it("Should successfully log in to rapidgator", async () => {
        await rapidgator.logIn();

        expect(rapidgator.sid.length).to.be.above(0);
    });

    it("Should upload a file by buffer to rapidgator", async () => {
        const fileURL = await rapidgator.upload({
            name: "file.test.random",
            buffer: randomBuffer(450000)
        });

        expect(fileURL).to.not.be.empty;
    }).timeout(20000);

    it("Should upload a file by filePath to rapidgator", async () => {
        const filePath = "/tmp/file.test.random";

        await fs.writeFile(filePath, randomBuffer(450000));

        const fileURL = await rapidgator.upload({
            name: "file.test.random",
            filePath: filePath
        });
        
        expect(fileURL).to.not.be.empty;
    }).timeout(20000);
});