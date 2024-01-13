# Quasar S3 photo albums web app

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#architecture">Architecture</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#create-s3-bucket">Create S3 bucket</a></li>
          <ul>
            <li><a href="#s3-bucket-policy">S3 bucket policy</a></li>
            <li><a href="#s3-cors-policy">S3 CORS policy</a></li>
          </ul>
        <li><a href="#integrate-with-imagekit">Integrate with ImageKit</a></li>
        <li><a href="#mapbox-api-key">Mapbox API key</a></li>
        <li><a href="#deploy-to-firebase-hosting">Deploy to Firebase hosting</a></li>
        <li><a href="#aws-lambda-function">AWS Lambda Function</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
    </li>
  </ol>
</details>

## About The Project
This is a fullstack photo album web app using Vue3, Quasar, Google Firebase hosting and AWS (including API Gateway, Lambda
function, S3 and dynamoDB). You can use this web app to display your photos in S3 bucket and manage your photos.

### Built with [![Vue][Vue.js]][Vue-url]

### Architecture
![Architecture](doc-images/GCP-AWS-Architecture.webp)

## Getting started
### Prerequisites

You will need the follows:
1. Google Firebase hosting
2. Google Place API key
3. Google OAuth 2.0 Client ID (For admin permission)
4. AWS user with appropriate permission
5. AWS S3 bucket
6. AWS DynamoDB table
7. AWS Lambda Function with API Gateway
8. ImageKit account
9. Mapbox API key

### Create S3 bucket
Before you start, you need create an AWS S3 bucket. Once you create it, replace this property `STATIC_FILES_URL` with
your real information in`.env.example` and modify file name to `.env`.
The file structure in the S3 bucket should be like this:
```
my-photo-S3-bucket/
 +- photo-album-a/     # Directory containing your photos
      +- photo-a-1.jpg
      +- photo-a-2.jpg
 +- photo-album-b/     # Directory containing your photos
      +- photo-b-1.jpg
      +- photo-b-2.jpg
```

#### S3 bucket policy
You usually want to make your S3 albums public so that your friends can see it. To achieve this, you need to add `getObject`
in the bucket policy (under `Permissions` tab):
```json
{
  "Version": "2012-10-17",
  "Id": "Policy1548223592786",
  "Statement": [
    {
      "Sid": "Read permission for every object in a bucket",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::{YOUR_BUCKET_NAME}/*"
    }
  ]
}
```

#### S3 CORS policy
Don't forget to put CORS into S3 bucket configuration[1] to prevent other people link your photos from their websites directly.
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

### Integrate with ImageKit
In order to reduce the traffic with S3 buckets (to save money!), this project integrate with ImageKit CDN. ImageKit.io
is a cloud-based image CDN with real-time image optimization and transformation features that help you deliver perfectly
optimized images across all devices[2]. You can follow this [documentation](https://imagekit.io/blog/image-optimization-resize-aws-s3-imagekit/)
to create an account in the ImageKit. You will have 20GB bandwidth per month as a free user. Once you have your own ImageKit
URL, replace this property `IMAGEKIT_URL` with your real information in`.env.example` and modify file name to `.env`. And
use the same URL in the `lambda` folder.

#### Important
If you change S3 bucket name, don't forget to update the configuration in ImageKit, and AWS IAM permission for Imagekit.

### Mapbox API key
This project uses Mapbox to display the [map](https://quasar-photo-albums-demo.web.app/map). You can get your own Mapbox API key [here](https://account.mapbox.com/auth/signup/).
Once you have your own Mapbox API key, replace this property `MAPBOX_API_KEY` with your real information in`.env.example`
and modify file name to `.env`.

### Google OAuth 2.0 client ID
Please check [here](https://developers.google.com/identity/protocols/oauth2) for further information. You will also need
to set up OAuth consent screen. Please check [here](https://developers.google.com/identity/protocols/oauth2/openid-connect#consent-screen)
Once you have Google OAuth 2.0 client ID, replace this property `GOOGLE_CLIENT_ID` with your real information in`.env.example`
and modify file name to `.env`. And use the same client ID in the `lambda` folder.

#### Login UI
Once you set up Google OAuth 2.0 client ID and OAuth consent screen, you can access login UI by going to `http://localhost:9000/login`.
You will also need to add your Google account information in the [DynamoDB table](lambda/README.md#aws-dynamodb) you created.
If every thing is set up correctly, you should be able to login with your Google account and see the admin page as below:
![web-capture1](doc-images/Web_capture_1.jpeg)
![web-capture2](doc-images/Web_capture_2.jpeg)
![web-capture3](doc-images/Web_capture_3.jpeg)
![web-capture4](doc-images/Web_capture_4.jpeg)

### Deploy to Firebase hosting
This web app uses Google Firebase for web hosting so Google will do all SSL configuration and CDN (for now).
* Visit `https://console.firebase.google.com` to create a new project
* Check [here](https://firebase.google.com/docs/hosting) for further detail about how to deploy your app to Firebase
* You can run this command to deploy your project locally: `npm run firebase-deploy`
* Place your Google Firebase information in the `.env` too (`GOOGLE_FIREBASE_API_KEY`, `GOOGLE_FIREBASE_AUTH_DOMAIN`,
`GOOGLE_FIREBASE_PROJECT_ID`, `GOOGLE_FIREBASE_APP_ID`)

### AWS Lambda Function
This project uses AWS Lambda Function to handle all APIs (as BFF, backend for frontend) and authentication process
once it's deployed to AWS. Please check further information in the `lambda` folder. [here](lambda/README.md)

## How to run locally
### Install the dependencies
```bash
$ npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
$ quasar dev
```
or
```bash
$ npm run serve
```

### Lint the files
```bash
$ npm run lint
```

### Build the app for production
```bash
$ quasar build
```
or
```bash
$ npm run build
```

### Deploy Quasar web app to Google Firebase Hosting
```bash
$ npm run firebase:deploy
```

### Customize the Quasar configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

### References
1. [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)
2. [Optimize and resize images in AWS S3 in real-time with ImageKit](https://imagekit.io/blog/image-optimization-resize-aws-s3-imagekit/)

<!-- MARKDOWN LINKS & IMAGES -->
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
