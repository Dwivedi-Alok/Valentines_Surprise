import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { s3 } from "../config/s3client.js";

const BUCKET = process.env.S3_BUCKET_NAME;

export const generateUploadUrl = async ({ fileName, contentType, folder }) => {
  const key = `${folder}/${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return { uploadUrl, key };
};

export const generateViewUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const viewUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return viewUrl;
};

export const listObjectsInFolder = async (folder) => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: folder,
  });

  const { Contents = [] } = await s3.send(command);

  const files = await Promise.all(
    Contents.map(async (file) => {
      const url = await generateViewUrl(file.Key);
      return {
        key: file.Key,
        url,
      };
    })
  );

  return files;
};
