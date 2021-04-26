# Quasar S3 album web app

This is a simple AWS S3 album app by using Vue3, Quasar and AWS SDK. You can use this web app to display your photos in S3 bucket.

## Getting started
### Create S3 bucket and Cognito Identity Pool
Before you start, please create an AWS S3 bucket and an AWS Cognito Identity Pool at first. Once you create them, put properties
AWS S3 bucket name (AWS_S3_BUCKET_NAME), region (AWS_REGION) and AWS Cognito identity pool ID (AWS_IDENTITY_POOL_ID) into
`quasar.conf.js` (under `build -> env` section) then you are good to go.

### S3 bucket policy
If you want to make your S3 albums public so that anyone can see it, you need to add `getObject` in the bucket policy:
```json
{
    "Version": "2012-10-17",
    "Id": "Policy1548223592786",
    "Statement": [
        {
            "Sid": "Stmt1548223591553",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_S3_BUCKET/photo-albums/®*"
        }
    ]
}
```

### S3 static website
If you want to place this Vue app in the s3 bucket along with your photos, you need to make your S3 bucket as a web server
to serve your js, css, font... etc files.

### Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

### References
* [Viewing Photos in an Amazon S3 Bucket from a Browser](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photos-view.html)
* [Enabling website hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html)
