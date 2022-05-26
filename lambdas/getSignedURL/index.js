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

  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);

  return JSON.stringify({
    uploadURL: uploadURL,
    Key,
  });
};

function extractUserDefinedMetadata(event) {
  const metadata = { ...event['headers'] };
  for (let property in metadata) {
    if (property.startsWith('x-amz-meta-')) {
      const newPropertyKey = property.substring(
        property.indexOf('x-amz-meta-') + 'x-amz-meta-'.length
      );
      metadata[newPropertyKey] = metadata[property];
    }
    delete metadata[property];
  }
  return metadata;
}
