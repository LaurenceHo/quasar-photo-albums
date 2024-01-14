# AWS Lambda Functions With ExpressJS Routing and TypeScript

## Prerequisites
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
      "Resource": "YOU_AWS_DYNAMODB_TABLE_ARN"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "YOUR_AWS_S3_BUCKET_ARN",
        "YOUR_AWS_S3_BUCKET_ARN/*"
      ]
    }
  ]
}
```
Once you create it, replace this properties `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` with
your real information in`.env.example` and modify file name to `.env`.

### AWS DynamoDB
Before doing local development, you need to create 3 DynamoDB tables in total:
1. `Albums` table: store album information
2. `AlbumTags` table: store album tags information
3. `Users` table: store user information

Once you create them, replace this properties `PHOTO_ALBUMS_TABLE_NAME`, `PHOTO_ALBUM_TAGS_TABLE_NAME`, `PHOTO_USER_PERMISSION_TABLE_NAME`
with your real information in`.env.example` and modify file name to `.env`.

The album object structure is as below:
```
id: string => it is the same as the folder name in s3
albumName: string
albumCover: string
description: string
tags: string[]
isPrivate: boolean
order: number
Place: JSON object
createdAt: string (Date time)
updatedAt: string (Date time)
createdBy: string (email)
updatedBy: string (email)
```
Example:
```json
{
  "id": {
    "S": "demo-album1"
  },
  "albumCover": {
    "S": "demo-album1/batch_berlin-8429780.jpg"
  },
  "albumName": {
    "S": "demo-album 1"
  },
  "description": {
    "S": "This is demo album 1"
  },
  "isPrivate": {
    "BOOL": false
  },
  "order": {
    "N": "1"
  },
  "place": {
    "M": {
      "displayName": {
        "S": "Museum of New Zealand Te Papa Tongarewa"
      },
      "formattedAddress": {
        "S": "55 Cable Street, Te Aro, Wellington 6011, New Zealand"
      },
      "location": {
        "M": {
          "latitude": {
            "N": "-41.290456299999995"
          },
          "longitude": {
            "N": "174.7820894"
          }
        }
      }
    }
  },
  "tags": {
    "L": [
      {
        "S": "tag1"
      }
    ]
  },
  "createdAt": {
    "S": "2023-08-20T08:11:13.171Z"
  },
  "createdBy": {
    "S": "System"
  },
  "updatedAt": {
    "S": "2023-12-28T05:18:54.372Z"
  },
  "updatedBy": {
    "S": "System"
  }
}

```
Album tag:
```json
{
  "tag": {
    "S": "tag1"
  }
}
```

User permission:
```json
{
  "uid": {
    "S": "xxxxxxxxxxx"
  },
  "email": {
    "S": "xxxxxxxxxx@gmail.com"
  },
  "displayName": {
    "S": "UserName"
  },
  "role": {
    "S": "admin"
  }
}
```

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
$ cd lambda
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

To get this application deployed, let's create a `serverless.yml` in our working directory. Before deploying Express.js
app to AWS Lambda, we need to compile TypeScript to JavaScript. We can use `serverless-plugin-typescript` to compile
TypeScript to JavaScript, and then use `serverless` to deploy it to AWS Lambda. After that, point `app.handler` to your
`serverless.yml`.

```yaml
# serverless.yml

service: my-express-application

provider:
  name: aws
  runtime: nodejs18.x
  stage: dev
  region: us-east-1

plugins:
  - serverless-plugin-typescript

functions:
  app:
    handler: src/app.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

Now, let's deploy it to AWS Lambda:
```bash
$ npx serverless deploy

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
Make sure your Lambda functions have the following permissions:

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
			"Resource": "YOU_AWS_DYNAMODB_TABLE_ARN"
		},
		{
			"Effect": "Allow",
			"Action": [
				"s3:PutObject",
				"s3:GetObject",
				"s3:DeleteObject",
				"s3:ListBucket"
			],
			"Resource": [
				"YOUR_AWS_S3_BUCKET_ARN",
				"YOUR_AWS_S3_BUCKET_ARN/*"
			]
		},
		{
			"Action": [
				"logs:CreateLogGroup",
				"logs:CreateLogStream",
				"logs:PutLogEvents",
				"logs:TagResource"
			],
			"Effect": "Allow",
			"Resource": [
				"YOUR_AWS_LOG_GROUP_ARN"
			]
		}
	]
}
```

### Enabling binary support using the API Gateway console
Make sure you enable binary support for your API Gateway. Otherwise, the uploaded photos will be corrupted.
1. Go to API Gateway console -> Select your API -> API Settings -> Binary Media Types -> Click "Manage media types"
2. Add `image/*` and `multipart/form-data` to the list of binary media types
3. Redeploy your Lambda functions or it won't take effect

Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings-configure-with-console.html) for the further information.

### Enable API Gateway Stage Logging
If your API Gateway returns an HTTP 502 status code, you can enable API Gateway stage logging by updating stage setting to get more information.
Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/stages.html#how-to-stage-settings-console) for the further information.

### Serverless dashboard
You can automate your deployment process by using [serverless dashboard](https://www.serverless.com/dashboard). It is free for personal use.
By doing  so, you will need to add env variables into `serverless.yml`:
```yaml
functions:
  app:
    handler: src/app.handler
    events:
      - http: ANY /
      - http: ANY /{proxy+}
    environment:
      AWS_REGION_NAME: ${self:provider.region}
      GOOGLE_PLACES_API_KEY: ${param:GOOGLE_PLACES_API_KEY}
      GOOGLE_CLIENT_ID: ${param:GOOGLE_CLIENT_ID}
      ALBUM_URL: ${param:ALBUM_URL}
      IMAGEKIT_CDN_URL: ${param:IMAGEKIT_CDN_URL}
      AWS_S3_BUCKET_NAME: ${param:AWS_S3_BUCKET_NAME}
      PHOTO_ALBUMS_TABLE_NAME: ${param:PHOTO_ALBUMS_TABLE_NAME}
      PHOTO_ALBUM_TAGS_TABLE_NAME: ${param:PHOTO_ALBUM_TAGS_TABLE_NAME}
      PHOTO_USER_PERMISSION_TABLE_NAME: ${param:PHOTO_USER_PERMISSION_TABLE_NAME}
```
And set up [parameters](https://www.serverless.com/framework/docs/guides/parameters) in your serverless dashboard.

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
* /api/photos - DELETE: Delete photos
* /api/photos - PUT: Move photos to different folder
* /api/photos/upload/:albumId - POST: Upload photos to AWS S3 folder

### Location
* /api/location/search - GET: Search location by keyword

## How to run locally

### Deploy to AWS Lambda Function
```bash
$ cd lambda
$ npm run deploy:lambda
```

Reference:
https://www.serverless.com/framework/docs
