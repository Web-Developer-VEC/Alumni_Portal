import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/aws.js";

export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string
): Promise<string> => {
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is not defined in environment variables");
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  // Return the public URL of the uploaded file
  // Note: This assumes the bucket is public or you are using it for public assets.
  return `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
};
