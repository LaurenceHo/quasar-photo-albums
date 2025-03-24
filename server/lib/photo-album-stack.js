import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
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
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY, // Enforce HTTP-only to S3 static website
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    },
    additionalBehaviors: {
      '/*.json': {
        origin: new origins.HttpOrigin(`${photoBucket.bucketWebsiteDomainName}`),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
    },
    defaultRootObject: 'index.html',
    errorResponses: [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
      },
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
    environment: {
      AWS_REGION_NAME: process.env.AWS_REGION_NAME,
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
      VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
      ALBUM_URL: process.env.ALBUM_URL,
      VITE_IMAGEKIT_CDN_URL: process.env.VITE_IMAGEKIT_CDN_URL,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
      PHOTO_ALBUMS_TABLE_NAME: process.env.PHOTO_ALBUMS_TABLE_NAME,
      PHOTO_ALBUM_TAGS_TABLE_NAME: process.env.PHOTO_ALBUM_TAGS_TABLE_NAME,
      PHOTO_USER_PERMISSION_TABLE_NAME: process.env.PHOTO_USER_PERMISSION_TABLE_NAME,
      DATA_AGGREGATIONS_TABLE_NAME: process.env.DATA_AGGREGATIONS_TABLE_NAME,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_OPTIONS: '--experimental-vm-modules',
    },
  });
};

const createAggregationsLambdaFunction = (scope, id, envType) => {
  return new lambda.Function(scope, id, {
    functionName: `${envType}-photo-album-api-aggregations`,
    runtime: lambda.Runtime.NODEJS_22_X,
    handler: 'aggregations/albums.handler',
    code: lambda.Code.fromAsset(path.join(rootDir, 'dist/lambda')),
    environment: {
      NODE_OPTIONS: '--experimental-vm-modules',
    },
  });
};
class ExistingPhotoAlbumStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { envType } = props;

    console.log(`Updating ${envType} photo album stack...`);

    // Import Existing S3 Bucket
    const photoBucket = s3.Bucket.fromBucketName(
      this,
      'QuasarPhotoAlbumBucket',
      process.env.AWS_S3_BUCKET_NAME,
    );

    // Import Existing DynamoDB Tables
    const albumTable = dynamodb.Table.fromTableAttributes(this, 'AlbumTable', {
      tableName: process.env.PHOTO_ALBUMS_TABLE_NAME,
      tableStreamArn: process.env.PHOTO_ALBUMS_STREAM_ARN,
    });

    const albumTagTable = dynamodb.Table.fromTableName(
      this,
      'AlbumTagTable',
      process.env.PHOTO_ALBUM_TAGS_TABLE_NAME,
    );

    const userPermissionTable = dynamodb.Table.fromTableName(
      this,
      'UserPermissionTable',
      process.env.PHOTO_USER_PERMISSION_TABLE_NAME,
    );

    const aggregationTable = dynamodb.Table.fromTableName(
      this,
      'AggregationTable',
      process.env.DATA_AGGREGATIONS_TABLE_NAME,
    );

    // Lambda Functions
    const appFunction = createAppLambdaFunction(this, `${envType}-app-function`, envType);
    const aggregationsFunction = createAggregationsLambdaFunction(
      this,
      `${envType}-aggregations-function`,
      envType,
    );

    // Grant permissions
    albumTable.grantReadWriteData(appFunction);
    albumTagTable.grantReadWriteData(appFunction);
    userPermissionTable.grantReadWriteData(appFunction);
    aggregationTable.grantReadWriteData(appFunction);
    photoBucket.grantReadWrite(appFunction);

    // Grant permissions to the aggregations function
    albumTable.grantStreamRead(aggregationsFunction);
    aggregationTable.grantReadWriteData(aggregationsFunction);

    // DynamoDB Stream to Lambda
    aggregationsFunction.addEventSource(
      new lambdaEventSources.DynamoEventSource(albumTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      }),
    );

    // API Gateway
    const api = new apigateway.RestApi(this, `${envType}-photo-album-api`, {
      restApiName: `${envType}-photo-album-api-gateway`,
      deployOptions: {
        stageName: envType,
      },
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(appFunction),
    });

    // CloudFront Distribution
    createCloudFrontDistribution(this, `${envType}-photo-albums-distribution`, photoBucket);
  }
}

export { ExistingPhotoAlbumStack };

class PhotoAlbumStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { envType } = props;

    console.log(`Creating ${envType} photo album stack...`);

    // S3 Bucket
    const photoBucket = new s3.Bucket(this, `${envType}-photo-album-bucket`, {
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
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['http://localhost:9000', process.env.ALBUM_URL],
          exposedHeaders: ['Date'],
          maxAge: 3600,
        },
      ],
    });

    // DynamoDB Tables
    const albumTable = new dynamodb.Table(this, 'AlbumTable', {
      tableName: process.env.PHOTO_ALBUMS_TABLE_NAME,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.KEYS_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      deletionProtection: true,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
    });

    const albumTagTable = new dynamodb.Table(this, 'AlbumTagTable', {
      tableName: process.env.PHOTO_ALBUM_TAGS_TABLE_NAME,
      partitionKey: { name: 'tag', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      deletionProtection: true,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
    });

    const userPermissionTable = new dynamodb.Table(this, 'UserPermissionTable', {
      tableName: process.env.PHOTO_USER_PERMISSION_TABLE_NAME,
      partitionKey: { name: 'uid', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      deletionProtection: true,
    });

    const aggregationTable = new dynamodb.Table(this, 'AggregationTable', {
      tableName: process.env.DATA_AGGREGATIONS_TABLE_NAME,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      deletionProtection: true,
    });

    // Lambda Functions
    const appFunction = createAppLambdaFunction(this, `${envType}AppFunction`, envType);
    const aggregationsFunction = createAggregationsLambdaFunction(
      this,
      `${envType}AggregationsFunction`,
      envType,
    );

    // Grant permissions
    albumTable.grantReadWriteData(appFunction);
    albumTagTable.grantReadWriteData(appFunction);
    userPermissionTable.grantReadWriteData(appFunction);
    aggregationTable.grantReadWriteData(appFunction);
    photoBucket.grantReadWrite(appFunction);

    // Grant permissions to the aggregations function
    albumTable.grantStreamRead(aggregationsFunction);
    aggregationTable.grantReadWriteData(aggregationsFunction);

    // DynamoDB Stream to Lambda
    aggregationsFunction.addEventSource(
      new lambdaEventSources.DynamoEventSource(albumTable, {
        startingPosition: lambda.StartingPosition.LATEST,
      }),
    );

    // API Gateway
    const api = new apigateway.RestApi(this, `${envType}PhotoAlbumApi`, {
      restApiName: `${envType}-photo-album-api-gateway`,
      deployOptions: {
        stageName: envType,
      },
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(appFunction),
    });

    // CloudFront Distribution
    const distribution = createCloudFrontDistribution(
      this,
      `${envType}PhotoAlbumsDistribution`,
      photoBucket,
    );

    // Update S3 bucket CORS configuration with CloudFront URL
    photoBucket.addCorsRule({
      allowedHeaders: ['*'],
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
      allowedOrigins: [
        'http://localhost:9000',
        'http://localhost:5173',
        process.env.ALBUM_URL,
        `https://${cloudFrontDistribution.domainName}`,
      ],
      exposedHeaders: ['Date'],
      maxAge: 3600,
    });
  }
}

export { PhotoAlbumStack };
