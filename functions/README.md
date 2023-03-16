# Functions With Express Routing and TypeScript

## Initializing a new Cloud Functions project with TypeScript
Reference:
https://firebase.google.com/docs/functions/typescript

Run `firebase init functions` in a new directory. The tool gives you options to build the project with JavaScript or TypeScript.
Choose *TypeScript* to output the following project structure:

```
myproject
 +- functions/     # Directory containing all your functions code
      |
      +- package.json  # npm package file describing your Cloud Functions code
      |
      +- tsconfig.json
      |
      +- .eslintrc.js # Optional file if you enabled ESLint
      |
      +- tsconfig.dev.json # Optional file that references .eslintrc.js
      |
      +- src/     # Directory containing TypeScript source
      |   |
      |   +- index.ts  # main source file for your Cloud Functions code
      |
      +- lib/
          |
          +- index.js  # Built/transpiled JavaScript code
          |
          +- index.js.map # Source map for debugging
```

Express routing comes built-in with the express module, making it easy to integrate with the Functions Framework.

Reference:

## Use Express.js
The following section provides a walk-through example for using Express.js with Firebase Hosting and Cloud Functions.

* Install Express.js in your local project by running the following command from your function directory:
```
npm install express --save
```

Open your /functions/src/index.ts file, then import and initialize Express.js:

```
import express, { Application, Request, Response } from 'express';
import * as functions from 'firebase-functions';

const app: Application = express();
```

Export the Express.js app as an HTTPS function:

```
export const main = functions.https.onRequest(app);
```

In your firebase.json file, direct all requests to the app function. This rewrite allows Express.js to serve the different sub-path that we configured (in this example, / and /api).

```
{
  "hosting": {
    // ...

    // Add the "rewrites" attribute within "hosting"
    "rewrites": [ {
        "source": "/api/**",
        "function": "main"
    } ]
  }
}
```
## API endpoint list
### Authentication
* /api/auth/userInfo - GET: Get user information
* /api/auth/verifyIdToken - POST: Verify user ID token with Firebase by using Google IDP
* /api/auth/logout - POST: User logout

### Album
* /api/albums - GET: Get all albums
* /api/albums - POST: Create a new album
* /api/albums - PUT: Update an album
* /api/albums/:albumId - DELETE: Delete an album

### Album tags
* /api/albumTags - GET: Get all album tags
* /api/albumTags - POST: Create a new album tags
* /api/albumTags/:tagId - DELETE: Delete album tag

### Photos
* /api/photos/:albumId - GET: Get photos by album ID
* /api/photos/photo - DELETE: Delete photo
* /api/photos/upload/:albumId - POST: Upload photos to AWS S3 folder
