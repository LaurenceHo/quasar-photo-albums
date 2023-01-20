# Quasar S3 photo albums web app (integrate with ImageKit Image CDN and Google Firebase)

This is a simple AWS S3 album app by using Vue3, Quasar, Google Firebase (including Firebase, Firestore and Cloud Functions)
and AWS SDK. You can use this web app to display your photos in S3 bucket. Since displaying photos from S3 directly only
has limited functionality (you can only display folder name as album name), I use Google Cloud Firestore to organise
my S3 photo folder information. In addition, this project is running on Google Cloud Firebase.

## Getting started
### Create S3 bucket and Cognito Identity Pool
Before you start, please create an AWS S3 bucket and an AWS Cognito Identity Pool at first [1]. Once you create them, replace those properties:
AWS_S3_BUCKET_NAME, AWS_REGION, AWS_IDENTITY_POOL_ID and IMAGEKIT_CDN_URL with your real information in`.env.example` and modify file name to `.env` then you are good to go.
The file structure in the S3 bucket should be like this:
```
/S3 bucket:
  | => album folder A/
         | => photo file A
         | => photo file B
  | => album folder B/
         | => photo file A
         | => photo file B
```

### S3 bucket policy
You usually want to make your S3 albums public so that your friends can see it, you need to add `getObject` in the bucket policy (under `Permissions` tab):
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
            "Resource": "arn:aws:s3:::{YOUR_S3_BUCKET}/*"
        }
    ]
}
```

### S3 CORS policy
Don't forget to put CORS into S3 bucket configuration[3] to prevent other people link your photos from their websites directly.
No matter where you deploy your app (AWS or Google Firebase), you should add those URLs for hosting your website into CORS configuration.
For example:
```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "http://www.example1.com"
        ],
        "ExposeHeaders": []
    }
]
```

### Architecture
![Architecture](GCP-AWS-Architecture.png)

### Integrate with ImageKit
In order to reduce the traffic with S3 buckets (to save money!), this project integrate with ImageKit CDN. ImageKit.io
is a cloud-based image CDN with real-time image optimization and transformation features that help you deliver perfectly
optimized images across all devices[4]. You can follow this [documentation](https://imagekit.io/blog/image-optimization-resize-aws-s3-imagekit/)
to create an account in the ImageKit. You will have 20GB bandwidth per month as a free user.

#### Important
If you change S3 bucket name, don't forget to update the configuration in ImageKit, AWS IAM permission for Cognito and Imagekit.

### S3 static website
If you want to place this Vue app in the S3 bucket along with your photos, you need to make your S3 bucket as a web server
to serve your js, css, font... etc files[2]. If you want to configure your S3 bucket as a static website using a custom domain,
you can check out this [documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html).

### Deploy to Firebase
Because I don't want to deal with SSL on my project, I deploy my project to Google Firebase and Google will do all SSL configuration for me.
* Visit `https://console.firebase.google.com` to create a new project
* Check [here](https://firebase.google.com/docs/hosting/quickstart) for further detail about how to deploy your app to Firebase
* You can run this command to deploy your project locally: `npm run firebase-deploy`
* Place your Google Firebase information in the `.env` too

### Google Cloud Firestore
As I mentioned, I use [Google Cloud Firestore](https://firebase.google.com/docs/firestore) to organise my S3 photo
folders information. I ran a small script to fetch all folders in S3 bucket and inserted folder name along with other
information into Google Firestore. The album object structure as below:
```
Album
{
  id: string;
  albumName: string;
  albumCover: string;
  desc: string;
  tags: string[];
  private: boolean;
}
```
Apart from adding or managing any data in the Firestore, it's very important to secure your data too. Please check out this
[document](https://firebase.google.com/docs/firestore/security/rules-structure) to apply security rules to your Firestore.

### Google Cloud Functions
I use Google Cloud Functions to handle all APIs (as BFF, backend for frontend) and authentication process so that I can
manage user's cookies, which I can use to against admin actions such as update album, delete album from Firestore as well as uploading photos to AWS S3 bucket.

### Upload photos to AWS S3 bucket
I use AWS Cognito identity pool to provide temporary credentials to access AWS S3 bucket for anonymous guest users or for users who have signed in.
Before uploading photos to AWS S3 bucket via Google Cloud Function, we need to set up AWS Cognito identity pool and IAM properly.
Make sure attaching correct permissions to the [IAM role](https://docs.aws.amazon.com/cognito/latest/developerguide/security_iam_service-with-iam.html)
which is used by AWS Cognito identity pool and use the [credential](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-credentials.html)
to access AWS S3 client. Since this project is using Google IDP, we need to enable Google login in the AWS Cognito.
Please check this [document](https://docs.aws.amazon.com/cognito/latest/developerguide/google.html).

### Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
or
npm run serve
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
or
npm run build
```

### Deploy to Google Firebase
```
npm run firebase:deploy
```

### Deploy to Google Cloud function
```
cd functions
npm run deploy:functions
```

### Simulate Google Cloud function
```
cd functions
npm run serve:functions
```

### Customize the Quasar configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

### References
1. [Viewing Photos in an Amazon S3 Bucket from a Browser](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photos-view.html)
2. [Enabling website hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html)
3. [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)
4. [Optimize and resize images in AWS S3 in real-time with ImageKit](https://imagekit.io/blog/image-optimization-resize-aws-s3-imagekit/)
5. [Secure your data in the Firestore](https://firebase.google.com/docs/firestore/security/rules-structure)
