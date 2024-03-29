# AWS Lambda Functions With ExpressJS Routing and TypeScript

## Prerequisites

For the detailed tutorial, you can also check [here](https://dev.to/laurenceho/deploy-app-to-aws-by-using-serverless-framework-2gen).

### Create AWS user in IAM

Before doing local development, you will need to create an AWS user in IAM with appropriate permission.
You AWS user needs to have the following permissions:

1. DynamoDB: PutItem, DeleteItem, GetItem, Scan, Query, UpdateItem
2. S3: PutObject, GetObject, DeleteObject, ListBucket
   Permissions for DynamoDB and S3 are required for this project. If you want to use other AWS services, you will need to add more permissions.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": ["YOU_AWS_DYNAMODB_TABLE_ARN"] // There should be 3 tables you created before
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["YOUR_AWS_S3_BUCKET_ARN", "YOUR_AWS_S3_BUCKET_ARN/*"]
    }
  ]
}
```

Once you create it, download access key and replace this properties `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` with
your real information in`.env.example` and modify file name to `.env`.

### AWS DynamoDB

Replace this properties `PHOTO_ALBUMS_TABLE_NAME`, `PHOTO_ALBUM_TAGS_TABLE_NAME`, `PHOTO_USER_PERMISSION_TABLE_NAME`
with your real information in`.env.example` and modify file name to `.env`. When you run Express.js locally, it will use
those environment variables to create table and insert mock into your DynamoDB, so you don't have to create tables manually.
You can see the initial dynamodb table in [./src/services/initialise-dynamodb-tables.ts](./src/services/initialise-dynamodb-tables.ts).

Once the tables are created, you can check them in AWS DynamoDB console.

### Get Google Places API key

You need to create a Google Places API key, so you can find a location information and attach it to your album object in DynamoDB.
Please check [here](https://developers.google.com/maps/documentation/places/web-service/get-api-key). Once you create it,
replace this property `GOOGLE_PLACES_API_KEY` with your real information in`.env.example` and modify file name to `.env`.

## Local development

### Install the dependencies

```bash
$ npm install
```

### Run ExpressJS locally

```bash
$ npm run start:server
```

## Use serverless-http to wrap Express.js app

Assume you already have an Express.js app, you can use `serverless-http` to wrap it and deploy to AWS Lambda and Api Gateway.

Firstly, install serverless-http

```bash
$ npm install -S serverless-http
```

Secondly, install serverless and serverless-plugin-typescript

```bash
$ npm install -S -D serverless serverless-plugin-typescript
```

Then, wrap your Express.js app with serverless-http

```javascript
// app.ts

import bodyParser from 'body-parser';
import serverless from 'serverless-http';
import express from 'express';

export const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!')
})

module.exports.handler = serverless(app);
```

We also need to export app object to index.ts, so you can run it locally.

```javascript
// index.ts

import { app } from './app';

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App is listening on port ${port}.`));
```

To get this application deployed, let's create a `serverless.yml` in our working directory. When we deploy to AWS
locally, we also need to install [serverless-dotenv-plugin](https://www.serverless.com/plugins/serverless-dotenv-plugin). It will load environment variables from `.env` file to
`serverless.yml`.

```bash
$ npm i -D serverless-dotenv-plugin
```

Your `serverless.yaml` should look like as below:

```yaml
service: my-express-application
provider:
  name: aws
  runtime: nodejs18.x
  stage: dev
  region: us-east-1

plugins:
  - serverless-plugin-typescript #A Serverless Framework plugin to transpile TypeScript before deploying
  - serverless-dotenv-plugin #You will need this plugin to import all variables from .env into functions

useDotenv: true #Enable the plugin

functions:
  app:
    handler: src/app.handler
    events:
      - http: ANY /
      - http: ANY /{proxy+}
    environment:
      AWS_REGION_NAME: ${self:provider.region}
      GOOGLE_PLACES_API_KEY: ${env:GOOGLE_PLACES_API_KEY}
      GOOGLE_CLIENT_ID: ${env:GOOGLE_CLIENT_ID}
      ALBUM_URL: ${env:ALBUM_URL}
      IMAGEKIT_CDN_URL: ${env:IMAGEKIT_CDN_URL}
      AWS_S3_BUCKET_NAME: ${env:AWS_S3_BUCKET_NAME}
      PHOTO_ALBUMS_TABLE_NAME: ${env:PHOTO_ALBUMS_TABLE_NAME}
      PHOTO_ALBUM_TAGS_TABLE_NAME: ${env:PHOTO_ALBUM_TAGS_TABLE_NAME}
      PHOTO_USER_PERMISSION_TABLE_NAME: ${env:PHOTO_USER_PERMISSION_TABLE_NAME}
      JWT_SECRET: ${env:JWT_SECRET}

custom:
  dotenv:
    exclude:
      - AWS_REGION_NAME
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
```

Now, let's deploy it to AWS Lambda:

```bash
$ npx serverless deploy
```

If this is your first time using Serverless Framework, you will be asked to set up your AWS credentials.
Please check [here](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) for further information.

```bash
> serverless deploy

DOTENV: Loading environment variables from .env:
         - GOOGLE_PLACES_API_KEY
         - GOOGLE_CLIENT_ID
         - JWT_SECRET
         - ALBUM_URL
         - IMAGEKIT_CDN_URL
         - AWS_S3_BUCKET_NAME
         - PHOTO_ALBUMS_TABLE_NAME
         - PHOTO_ALBUM_TAGS_TABLE_NAME
         - PHOTO_USER_PERMISSION_TABLE_NAME

Deploying my-serverless-app to stage dev (us-east-1, "default" provider)
Compiling with Typescript...
Using local tsconfig.json - tsconfig.json
Typescript compiled.

... snip ...

Service Information
service: my-express-application
stage: dev
region: us-east-1
stack: my-express-application-dev
api keys:
  None
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  app: my-express-application-dev-app
```

You can check your AWS Lambda function in AWS console. You should see a new Lambda function and API Gateway created.

### AWS Permissions

Because your Lambda function will access S3 bucket and DynamoDB, make sure your Lambda functions have the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": ["YOU_AWS_DYNAMODB_TABLE_ARN"] // There should be 3 tables you created before
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["YOUR_AWS_S3_BUCKET_ARN", "YOUR_AWS_S3_BUCKET_ARN/*"]
    },
    {
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:TagResource"],
      "Effect": "Allow",
      "Resource": ["YOUR_AWS_LOG_GROUP_ARN"]
    }
  ]
}
```

### Enabling binary support using the API Gateway console

Next, you need to enable binary support using the API gateway console. Otherwise, the uploaded photos will be corrupted.
I dug around in Serverless Framework doc, and I couldn't find a way to configure serverless.yml to enable binary support.
It means we have to enable it using AWS admin console.

1. Go to API Gateway console -> Select your API -> API Settings -> Binary Media Types -> Click "Manage media types"
2. Add `image/*` and `multipart/form-data` to the list of binary media types
3. Redeploy your Lambda functions or it won't take effect

Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings-configure-with-console.html) for the further information.

### Enable API Gateway Stage Logging

If your API Gateway returns an HTTP 502 status code, you can enable API Gateway stage logging by updating stage setting to get more information.
Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/stages.html#how-to-stage-settings-console) for the further information.

## API endpoint list

### Authentication

- /api/auth/userInfo - GET: Get user information
- /api/auth/verifyIdToken - POST: Verify user ID token with Firebase by using Google IDP
- /api/auth/logout - POST: User logout

### Album

- /api/albums - GET: Get all albums
- /api/albums - POST: Create a new album
- /api/albums - PUT: Update an album
- /api/albums/:albumId - DELETE: Delete an album

### Album tags

- /api/albumTags - GET: Get all album tags
- /api/albumTags - POST: Create a new album tags
- /api/albumTags/:tagId - DELETE: Delete album tag

### Photos

- /api/photos/:albumId - GET: Get photos by album ID
- /api/photos - DELETE: Delete photos
- /api/photos - PUT: Move photos to different folder
- /api/photos/rename - PUT: Rename photo
- /api/photos/upload/:albumId - POST: Upload photos to AWS S3 folder

### Location

- /api/location/search - GET: Search location by keyword
