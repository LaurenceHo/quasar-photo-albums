import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
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
      PHOTO_ALBUMS_TABLE_NAME: process.env.PHOTO_ALBUMS_TABLE_NAME,
      PHOTO_ALBUM_TAGS_TABLE_NAME: process.env.PHOTO_ALBUM_TAGS_TABLE_NAME,
      PHOTO_USER_PERMISSION_TABLE_NAME: process.env.PHOTO_USER_PERMISSION_TABLE_NAME,
      DATA_AGGREGATIONS_TABLE_NAME: process.env.DATA_AGGREGATIONS_TABLE_NAME,
      TRAVEL_RECORDS_TABLE_NAME: process.env.TRAVEL_RECORDS_TABLE_NAME,
      WORKER_URL: process.env.WORKER_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_OPTIONS: '--experimental-vm-modules',
      ENVIRONMENT: envType,
    },
  });
};

const createAggregationsLambdaFunction = (scope, id, envType) => {
  return new lambda.Function(scope, id, {
    functionName: `${envType}-photo-album-api-aggregations`,
    runtime: lambda.Runtime.NODEJS_22_X,
    handler: 'aggregations/albums.handler',
    code: lambda.Code.fromAsset(path.join(rootDir, 'dist/lambda')),
    timeout: cdk.Duration.seconds(15),
    environment: {
      NODE_OPTIONS: '--experimental-vm-modules',
      AWS_REGION_NAME: process.env.AWS_REGION_NAME,
      PHOTO_ALBUMS_TABLE_NAME: process.env.PHOTO_ALBUMS_TABLE_NAME,
      DATA_AGGREGATIONS_TABLE_NAME: process.env.DATA_AGGREGATIONS_TABLE_NAME,
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

    // DynamoDB Tables - Reuse if exists, otherwise create
    const albumTable = this.getOrCreateDynamoTable(
      'AlbumTable',
      process.env.PHOTO_ALBUMS_TABLE_NAME || 'photo-albums',
      {
        partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
        stream: dynamodb.StreamViewType.KEYS_ONLY,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        deletionProtection: true,
        pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
        billingMode: dynamodb.BillingMode.PROVISIONED,
        ProvisionedThroughput: { ReadCapacityUnits: 4, WriteCapacityUnits: 1 },
      },
      process.env.PHOTO_ALBUMS_STREAM_ARN,
    );

    const albumTagTable = this.getOrCreateDynamoTable(
      'AlbumTagTable',
      process.env.PHOTO_ALBUM_TAGS_TABLE_NAME || 'photo-album-tags',
      {
        partitionKey: { name: 'tag', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        deletionProtection: true,
        pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
        billingMode: dynamodb.BillingMode.PROVISIONED,
        ProvisionedThroughput: { ReadCapacityUnits: 4, WriteCapacityUnits: 1 },
      },
    );

    const userPermissionTable = this.getOrCreateDynamoTable(
      'UserPermissionTable',
      process.env.PHOTO_USER_PERMISSION_TABLE_NAME || 'user-permission',
      {
        partitionKey: { name: 'uid', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'email', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        deletionProtection: true,
      },
    );

    const aggregationTable = this.getOrCreateDynamoTable(
      'AggregationTable',
      process.env.DATA_AGGREGATIONS_TABLE_NAME || 'data-aggregations',
      {
        partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        deletionProtection: true,
        pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
        billingMode: dynamodb.BillingMode.PROVISIONED,
        ProvisionedThroughput: { ReadCapacityUnits: 4, WriteCapacityUnits: 1 },
      },
    );

    const travelRecordTable = this.getOrCreateDynamoTable(
      'TravelRecordsTable',
      process.env.TRAVEL_RECORDS_TABLE_NAME || 'travel-records',
      {
        partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        deletionProtection: true,
        pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
        billingMode: dynamodb.BillingMode.PROVISIONED,
        ProvisionedThroughput: { ReadCapacityUnits: 4, WriteCapacityUnits: 1 },
        globalSecondaryIndexes: [
          {
            indexName: 'gsi1',
            partitionKey: { name: 'gsi1pk', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'gsi1sk', type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
        ],
      },
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
    travelRecordTable.grantReadWriteData(appFunction);
    photoBucket.grantReadWrite(appFunction);

    appFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Query'],
        resources: [travelRecordTable.tableArn, `${travelRecordTable.tableArn}/index/*`],
      }),
    );

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

  getOrCreateDynamoTable(id, tableName, tableProps, streamArn = null) {
    if (tableName) {
      try {
        console.log(`Attempting to retrieve DynamoDB table: ${tableName}`);
        if (streamArn) {
          return dynamodb.Table.fromTableAttributes(this, id, {
            tableName,
            tableStreamArn: streamArn,
          });
        }
        return dynamodb.Table.fromTableName(this, id, tableName);
      } catch (e) {
        console.log('Error: ', e);
        console.log(`DynamoDB table ${tableName} not found, creating new one...`);
        return new dynamodb.Table(this, id, { tableName, ...tableProps });
      }
    } else {
      throw new Error(`Table name for ${id} must be provided in environment variables.`);
    }
  }
}

export { PhotoAlbumStack };
