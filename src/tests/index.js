import { expect } from "chai";
import randomBuffer from "random-buffer";
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

    it("Should upload a file to rapidgator", async () => {
        const fileURL = await rapidgator.upload({
            name: "file.test.random",
            buffer: randomBuffer(450000)
        });

        expect(fileURL).to.not.be.empty;
    }).timeout(20000);
});