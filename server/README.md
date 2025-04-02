# AWS Lambda Functions With Fastify and TypeScript

## Prerequisites

For the detailed tutorial, you can also check [here](https://dev.to/laurenceho/deploy-app-to-aws-by-using-serverless-framework-2gen). You can also check how to migrate Express.js to Fastify [here](https://dev.to/laurenceho/from-expressjs-to-fastify-45d4).

### Create an AWS user in IAM

Before doing local development, you will need to create an AWS user in IAM with appropriate permission.
You AWS user needs to have the following permissions:

1. DynamoDB: PutItem, DeleteItem, GetItem, Scan, Query, UpdateItem
2. S3: PutObject, GetObject, DeleteObject, ListBucket
   Permissions for DynamoDB and S3 are required for this project. If you want to use other AWS services, you will need to add more permissions.
3. AWS CDK deployment permission which involves with various AWS services such as CloudFormation, Lambda and LogGroup

I'd suggest this user has admin permission, and restrict it only be used in your local environment.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

Once you create it, download access key and replace this properties `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` with
your real information in `.env.example` and modify file name to `.env`.

### Bootstrap AWS CDK

Before using AWS CDK to depoly your app, you need to run bootstrap first, so CDK will create necessary resources in your AWS account. Specifically, it:

1. Creates an S3 bucket to store deployment assets (like Lambda function code).
2. Sets up IAM roles and policies needed for CDK deployments.
3. Creates a CloudFormation stack named "CDKToolkit" that manages these bootstrap resources.

This is a one-time setup per AWS account and region. You need to run it before your first CDK deployment in a new account/region combination.

You can see these resources in your AWS Console after running bootstrap:

- S3 bucket named like "cdktoolkit-stagingbucket-xxxxx"
- IAM roles with names starting with "cdk-"
- CloudFormation stack named "CDKToolkit"

Before running cdk bootstrap , you need to ensure:

1. AWS credentials are properly configured with sufficient permissions. Make sure your .env file has:

```properties
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION_NAME=your_region
CDK_DEFAULT_ACCOUNT=your_account_id
```

2. Install the required dependencies:

```bash
$ bun install
```

3. Bootstrap your AWS account:

```bash
$ bun run cdk:bootstrap
```

### Deploy AWS DynamoDB and S3 bucket by AWS CDK

Before you start, you need to create DynamoDB tablas and S3 bucket. This bucket will be for your SPA website hosting, and storing your photos. Replace these properties `AWS_S3_BUCKET_NAME` along with `PHOTO_ALBUMS_TABLE_NAME`, `PHOTO_ALBUM_TAGS_TABLE_NAME`, `PHOTO_USER_PERMISSION_TABLE_NAME`, `TRAVEL_RECORDS_TABLE_NAME` and `DATA_AGGREGATIONS_TABLE_NAME` with the table name you want to use in `.env.example` and modify file name to `.env`. When you run `bun run cdk:deploy`, it will use those environment variables to create S3 bucket and tables, so you don't have to create S3 bucket and tables manually. Once the S3 bucket and tables are created, you can check them in AWS console. You will also need to replace `VITE_IMAGEKIT_CDN_URL` with the CloudFront Domain name URL Serverless Framework created for you.

### AWS Permissions

If you deploy your Lambda function and API Gateway by running the above command `bun run cdk:deploy`, AWS CDK will deal with AWS permissions for you as long as you set up the correct DynamoDB table names and S3 bucket name.

### Enabling binary support using the API Gateway console

Next, you need to enable binary support using the API gateway console. Otherwise, the uploaded photos will be corrupted.
Unfortunately, there is no way to configure serverless.yml to enable binary support. It means we have to enable it
using AWS admin console.

1. Go to API Gateway console -> Select your API -> API Settings -> Binary Media Types -> Click "Manage media types"
2. Add `image/*` and `multipart/form-data` to the list of binary media types
3. Redeploy your Lambda functions or it won't take effect

Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings-configure-with-console.html) for the further information.

### Enable API Gateway Stage Logging

If your API Gateway returns an HTTP 502 status code, you can enable API Gateway stage logging by updating stage setting to get more information.
Please check [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/stages.html#how-to-stage-settings-console) for the further information.

### ElectroDB

The server uses [ElectroDB](https://electrodb.dev) to operate documentations in DynamoDB. ElectroDB eases the use of having multiple
entities and complex hierarchical relationships in a single DynamoDB table.

### Get Google Places API key

You need to create a Google Places API key, so you can find a location information and attach it to your album object in DynamoDB.
Please check [here](https://developers.google.com/maps/documentation/places/web-service/get-api-key). Once you create it,
replace this property `GOOGLE_PLACES_API_KEY` with your real information in `.env.example` and modify file name to `.env`.

## Local development

### Install the dependencies

```bash
$ bun install
```

### Run Fastify locally

```bash
$ bun run start:server
```

## Use serverless-http to wrap Fastify app

Assume you already have a Fastify app, you can use `serverless-http` to wrap it and deploy to AWS Lambda and Api Gateway.
You can find my detailed tutorial [here](https://dev.to/laurenceho/from-expressjs-to-fastify-45d4).

Firstly, install serverless-http

```bash
$ bun add serverless-http
```

Then, wrap your Fastify app with serverless-http

```typescript
// app.ts
import Fastify, { FastifyInstance } from 'fastify';

export const app: FastifyInstance = Fastify();

app.get('/', (request: FastifyRequest, reply: FastifyReply) => {
  reply.send('Hello World!');
});

export const handler = serverless(app as any);
```

## API endpoint list

### Authentication

- /api/auth/userInfo - GET: Get user information
- /api/auth/verifyIdToken - POST: Verify user ID token with Firebase by using Google IDP
- /api/auth/logout - POST: User logout

### Album

- /api/albums/:year - GET: Get albums by year
- /api/albums - POST: Create a new album
- /api/albums - PUT: Update an album
- /api/albums - DELETE: Delete an album

### Album tags

- /api/albumTags - GET: Get all album tags
- /api/albumTags - POST: Create a new album tags
- /api/albumTags/:tagId - DELETE: Delete album tag

### Photos

- /api/photos/:year/:albumId - GET: Get photos by album ID
- /api/photos - DELETE: Delete photos
- /api/photos - PUT: Move photos to different folder
- /api/photos/rename - PUT: Rename photo
- /api/photos/upload/:albumId - POST: Upload photos to AWS S3 folder

### Location

- /api/location/search - GET: Search location by keyword

### Aggregate

- /api/aggregate/:type - GET: Get aggregate data by type
