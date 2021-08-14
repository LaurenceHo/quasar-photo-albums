# Quasar S3 album web app (integrate with ImageKit Image CDN)

This is a simple AWS S3 album app by using Vue3, Quasar and AWS SDK. You can use this web app to display your photos in S3 bucket.

## Getting started
### Create S3 bucket and Cognito Identity Pool
Before you start, please create an AWS S3 bucket and an AWS Cognito Identity Pool at first [1]. Once you create them, put properties
AWS S3 bucket name (AWS_S3_BUCKET_NAME), region (AWS_REGION), AWS Cognito identity pool ID (AWS_IDENTITY_POOL_ID) and ImageKit ID (IMAGEKIT_CDN_URL)
into`quasar.conf.js` (under `build -> env` section) then you are good to go.

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
            "Resource": "arn:aws:s3:::YOUR_S3_BUCKET/*"
        }
    ]
}
```

### S3 static website
If you want to place this Vue app in the S3 bucket along with your photos, you need to make your S3 bucket as a web server
to serve your js, css, font... etc files[2]. If you want to configure your S3 bucket as a static website using a custom domain,
you can check out this [documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html).

### S3 CORS policy
If you don't want anyone can link to your photos from their website, don't forget to put CORS into S3 bucket configuration[3].

### Integrate with ImageKit
In order to reduce the traffic with S3 buckets (to save money!), this project will integrate with ImageKit CDN.
ImageKit.io is a cloud-based image CDN with real-time image optimization and transformation features that help you
deliver perfectly optimized images across all devices[4]. You can follow this [documentation](https://imagekit.io/blog/image-optimization-resize-aws-s3-imagekit/)
to create an account in the ImageKit. You will have 20Gb bandwidth per month as a free user.

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
1. [Viewing Photos in an Amazon S3 Bucket from a Browser](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photos-view.html)
2. [Enabling website hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html)
3. [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)
4. [Optimize and resize images in AWS S3 in real-time with ImageKit](https://imagekit.io/blog/image-optimization-resize-aws-s3-imagekit/)
