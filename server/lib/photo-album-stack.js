import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const createCloudFrontDistribution = (scope, id, photoBucket) => {
  return new cloudfront.Distribution(scope, id, {
    defaultBehavior: {
      origin: new origins.HttpOrigin(`${photoBucket.bucketWebsiteDomainName}`, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    },
    additionalBehaviors: {
      '/*.json': {
        origin: new origins.HttpOrigin(`${photoBucket.bucketWebsiteDomainName}`, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
    },
    defaultRootObject: 'index.html',
    errorResponses: [
      { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
      { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
    ],
    enableIpv6: true,
  });
};

const createAppLambdaFunction = (scope, id, envType) => {
  return new lambda.Function(scope, id, {
    functionName: `${envType}-photo-album-api-app`,
    runtime: lambda.Runtime.NODEJS_22_X,
    handler: 'app.handler',
    code: lambda.Code.fromAsset(path.join(rootDir, 'dist/lambda')),
    timeout: cdk.Duration.seconds(15),
    environment: {
      AWS_REGION_NAME: process.env.AWS_REGION_NAME,
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
      VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
      ALBUM_URL: process.env.ALBUM_URL,
      VITE_IMAGEKIT_CDN_URL: process.env.VITE_IMAGEKIT_CDN_URL,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
      WORKER_URL: process.env.WORKER_URL,
      WORKER_SECRET: process.env.WORKER_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_OPTIONS: '--experimental-vm-modules',
      ENVIRONMENT: envType,
    },
  });
};

class PhotoAlbumStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { envType } = props;

    console.log(`Processing ${envType} photo album stack...`);

    // S3 Bucket - Reuse if exists, otherwise create
    let photoBucket;
    if (process.env.AWS_S3_BUCKET_NAME) {
      try {
        photoBucket = s3.Bucket.fromBucketName(
          this,
          `${envType}PhotoAlbumBucket`,
          process.env.AWS_S3_BUCKET_NAME,
        );
        console.log(`Reusing existing S3 bucket: ${process.env.AWS_S3_BUCKET_NAME}`);
      } catch (e) {
        console.log('Error: ', e);
        console.log(`S3 bucket ${process.env.AWS_S3_BUCKET_NAME} not found, creating new one...`);
        photoBucket = this.createNewS3Bucket(envType);
      }
    } else {
      throw new Error('AWS_S3_BUCKET_NAME must be provided in environment variables.');
    }

    // Lambda Functions
    const appFunction = createAppLambdaFunction(this, `${envType}-app-function`, envType);

    // Grant permissions
    photoBucket.grantReadWrite(appFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, `${envType}-photo-album-api`, {
      restApiName: `${envType}-photo-album-api-gateway`,
      deployOptions: { stageName: envType },
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(appFunction),
    });

    // CloudFront Distribution
    const cloudFrontDistribution = createCloudFrontDistribution(
      this,
      `${envType}-photo-albums-distribution`,
      photoBucket,
    );

    // Update S3 CORS if bucket was newly created or imported
    if (photoBucket instanceof s3.Bucket) {
      photoBucket.addCorsRule({
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: [
          'http://localhost:9000',
          process.env.ALBUM_URL,
          `https://${cloudFrontDistribution.domainName}`,
        ],
        exposedHeaders: ['Date'],
        maxAge: 3600,
      });
    } else {
      console.log(
        'Imported S3 bucket detected. CORS must be updated manually or via a custom resource.',
      );
    }
  }

  createNewS3Bucket(envType) {
    return new s3.Bucket(this, `${envType}PhotoAlbumBucket`, {
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      versioned: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          prefix: 'NonCurrentVersion',
          noncurrentVersionExpiration: cdk.Duration.days(60),
        },
      ],
    });
  }
}

export { PhotoAlbumStack };
