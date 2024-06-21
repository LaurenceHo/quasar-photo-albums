import dotenv from 'dotenv';

dotenv.config();

export const configuration = {
  region: process.env['AWS_REGION_NAME'] || 'us-east-1',
};
