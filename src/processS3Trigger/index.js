console.log('Loading function');

const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const ses = new aws.SES({ apiVersion: '2010-12-01' });
const configSetName = process.env['SES_CONFIG_SET_NAME'];
const body = `
  <html> 
     <head></head> 
     <body> 
       <h2>Email DNApal!</h2> 
       <br/> 
       <p>You DNA has been processed. Open the app to see your advice</p>
     </body>
   </html>
   `;
var sesParams = {
  Destination: {
    ToAddresses: [],
  },
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: body,
      },
      Text: {
        Charset: 'UTF-8',
        Data: 'Your DNA has been processed.',
      },
    },
    Subject: {
      Charset: 'UTF-8',
      Data: 'DNApal - Processing Completed',
    },
  },
  Source: 'dominicfarr@gmail.com',
  ConfigurationSetName: configSetName,
};

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    const { ContentType, Metadata } = await s3.getObject(params).promise();
    console.log('CONTENT TYPE:', ContentType);
    await sendMail(Metadata.email);
    return ContentType;
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
};

async function sendMail(email) {
  try {
    sesParams.Destination.ToAddresses.push(email);
    const key = await ses.sendEmail(sesParams).promise();
    console.log('EMAIL SENT', key);
  } catch (e) {
    console.error(e);
  }
  return;
}
