import {
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "../config/aws.js";
export const deleteFileFromS3 = async (
  fileUrl: string
): Promise<void> => {
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is not defined in environment variables");
  }

  const url = new URL(fileUrl);

  // Remove leading "/"
  const key = decodeURIComponent(
    url.pathname.substring(1)
  );

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
};