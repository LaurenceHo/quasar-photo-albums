# Functions With Express Routing

Express routing comes built-in with the express module, making it easy to integrate with the Functions Framework.

Reference:
https://firebase.google.com/docs/hosting/functions#use_a_web_framework

The following section provides a walk-through example for using Express.js with Firebase Hosting and Cloud Functions.

* Install Express.js in your local project by running the following command from your functions directory:
```
npm install express --save
```

Open your /functions/index.js file, then import and initialize Express.js:

```
const functions = require('firebase-functions');
const express = require('express');
const app = express();
```

Export the Express.js app as an HTTPS function:

```
exports.app = functions.https.onRequest(app);
```

In your firebase.json file, direct all requests to the app function. This rewrite allows Express.js to serve the different subpath that we configured (in this example, / and /api).

```
{
  "hosting": {
    // ...

    // Add the "rewrites" attribute within "hosting"
    "rewrites": [ {
      "source": "**",
      "function": "app"
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
