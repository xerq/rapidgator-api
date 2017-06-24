# rapidgator [![NPM version](https://badge.fury.io/js/rapidgator.svg)](http://badge.fury.io/js/rapidgator)

Javascript module for accessing the Rapidgator's API

## Features:

 * Log In to account
 * Upload file by file path
 * Upload file by `Buffer`
 * Upload file to folder

## Installation

`npm install rapidgator --save`

## Usage

```javascript
import Rapidgator from "rapidgator";

const loginOptions = {
    login: "yourlogin",
    password: "yourpassword"
};

const rapidgator = new Rapidgator(loginOptions);

rapidgator.logIn().then(() => {
    const uploadOptionsFilepath = {
        name: "filename.txt",
        filePath: "/tmp/somefile.txt"
    };

	const uploadOptionsBuffer = {
        name: "filename.txt",
        buffer: fs.readFileSync("/tmp/somefile.txt")
    };

    rapidgator.upload(uploadOptionsFilepath).then((url) => console.log(`Your file has been uploaded. URL: ${url}`)).catch(console.error);
}).catch((err) => console.error("Failed on logging in. Error: ", err));
```
