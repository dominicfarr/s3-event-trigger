'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
const URL_EXPIRATION_SECONDS = 120;

// Main Lambda entry point
exports.handler = async (event) => {
  return await getUploadURL(event);
};

const getUploadURL = async function (event) {
  const metadata = extractUserDefinedMetadata(event);

  const randomID = parseInt(Math.random() * 10000000);
  const Key = uuid.v4() + '.dna';

  // Get signed URL from S3
  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: 'text/plain',
    Metadata: metadata,
    // This ACL makes the uploaded object publicly readable. You must also uncomment
    // the extra permission for the Lambda function in the SAM template.

    // ACL: 'public-read'
  };

  console.log('Params: ', s3Params);
  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);

  return JSON.stringify({
    uploadURL: uploadURL,
    Key,
  });
};

function extractUserDefinedMetadata(event) {
  const metadata = { ...event['headers'] };
  console.log('shallow copy headers', metadata);
  for (let property in metadata) {
    if (!property.startsWith('x-amz-meta-')) {
      console.log(`prop ${property} will be deleted from metadata`);
      delete metadata[property];
      console.log(metadata);
    }
  }
  return metadata;
}
