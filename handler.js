const AWS = require('aws-sdk');
const parseMultipart = require('parse-multipart');

const BUCKET = process.env.BUCKET;

const s3 = new AWS.S3();

module.exports.uploadFile = async (event, context) => {
  try {
    const { filename, data } = extractFile(event)
    await s3.putObject({ Bucket: BUCKET, Key: filename, ACL: 'public-read', Body: data }).promise();

    const lambda = new AWS.Lambda();

    const payload = {
      body: JSON.stringify({
        filenamedb: filename,
        urldb: `https://${BUCKET}.s3.amazonaws.com/${filename}`
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const resultLambda = await lambda.invoke({
      FunctionName: 'serverless-lambda-crud-s3-dev-dynamodbPut',
      Payload: JSON.stringify(payload)
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ link: `https://${BUCKET}.s3.amazonaws.com/${filename}` })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.stack })
    }
  }
}

function extractFile(event) {
  const boundary = parseMultipart.getBoundary(event.headers['content-type'])
  const parts = parseMultipart.Parse(Buffer.from(event.body, 'base64'), boundary);
  console.log(parts);
  if (parts.length === 0 || !parts[0].filename || !parts[0].data) {
    throw new Error('No se encontró el archivo en el cuerpo del evento.');
  }
  const [{ filename, data }] = parts;
  return {
    filename,
    data
  }
}
