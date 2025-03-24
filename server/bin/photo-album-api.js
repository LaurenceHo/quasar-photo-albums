#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ExistingPhotoAlbumStack } from '../lib/photo-album-stack.js';
import * as dotenv from 'dotenv';

console.log('Loading environment variables...');
dotenv.config();

console.log('Creating CDK app...');
const app = new cdk.App();

new ExistingPhotoAlbumStack(app, 'PhotoAlbumDevStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.AWS_REGION_NAME },
  envType: 'dev',
});

new ExistingPhotoAlbumStack(app, 'PhotoAlbumProdStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.AWS_REGION_NAME },
  envType: 'prod',
});

console.log('Stack created/updated, ready for deployment');
