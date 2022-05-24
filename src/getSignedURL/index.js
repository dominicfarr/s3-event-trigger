'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
const URL_EXPIRATION_SECONDS = 120;

// Main Lambda entry point
exports.handler = async (event) => {
  return await getUploadURL(event);
};

const getUploadURL = async function (event) {
  const randomID = parseInt(Math.random() * 10000000);
  const Key = `${randomID}.txt`;

  // Get signed URL from S3
  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: 'text/plain',

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
