const aws = require('aws-sdk');
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
  return await sendMail(event.email);
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
