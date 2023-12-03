# AWS Lambda Functions With Express Routing and TypeScript

## Use serverless-http to wrap Express.js app
Assume you already have an Express.js app, you can use serverless-http to wrap it and deploy to AWS Lambda.

Firstly, install serverless-http and serverless
```bash
$ npm install --save serverless-http
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

To get this application deployed, let's create a `serverless.yml` in our working directory:

```yaml
# serverless.yml

service: my-express-application

provider:
  name: aws
  runtime: nodejs18.x
  stage: dev
  region: us-east-1

functions:
  app:
    handler: lib/src/app.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

Before deploying Express.js app to AWS Lambda, we need to compile TypeScript to JavaScript. We can use `tsc` to compile
TypeScript to JavaScript, and then use `serverless` to deploy it to AWS Lambda. After that, point `app.handler` to your
`serverless.yml`.

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
  ANY - https://bl4r0gjjv5.execute-api.us-east-1.amazonaws.com/dev
  ANY - https://bl4r0gjjv5.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
functions:
  app: my-express-application-dev-app
```

## AWS Permissions
Make sure your Lambda functions have the following permissions:

```yaml
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"dynamodb:PutItem",
				"dynamodb:DeleteItem",
				"dynamodb:GetItem",
				"dynamodb:Scan",
				"dynamodb:Query",
				"dynamodb:UpdateItem"
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

## Enabling binary support using the API Gateway console
Make sure you enable binary support for your API Gateway. Otherwise, the uploaded photos will be corrupted.
1. Go to API Gateway console -> Select your API -> API Settings -> Binary Media Types -> Click "Manage media types"
2. Add `image/*` and `multipart/form-data` to the list of binary media types
3. Redeploy your Lambda functions or it won't take effect

Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings-configure-with-console.html) for the further information.

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

Reference:
https://www.serverless.com/framework/docs
