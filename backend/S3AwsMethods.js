const { S3Client, PutObjectCommand,GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require('dotenv').config();

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const getObjectUrl=async(key)=> {
  const command = new GetObjectCommand({
    Bucket: "nodejsprivate",
    Key: key,
    ResponseContentDisposition: 'attachment'
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
}
const getShareableUrl=async(key)=> {
  const command = new GetObjectCommand({
    Bucket: "nodejsprivate",
    Key: key,
    // ResponseContentDisposition: 'attachment'
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
}

module.exports={s3Client,getObjectUrl,getShareableUrl}