const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-7",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} key - S3 object key (path/filename)
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadFile = async (fileBuffer, key, contentType) => {
  try {

    if (!BUCKET_NAME) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the URL
    const url = `https://${BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "ap-southeast-7"
    }.amazonaws.com/${key}`;
    return { url, key };
  } catch (error) {
    console.error("❌ S3 Upload Error:", error.message);
    console.error("  Error Code:", error.Code || error.code);
    console.error("  Full Error:", error);
    throw error;
  }
};

/**
 * Get signed URL for viewing/downloading
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default 1 hour)
 * @returns {Promise<string>}
 */
const getObjectUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
};

/**
 * Delete object from S3
 * @param {string} key - S3 object key
 * @returns {Promise<void>}
 */
const deleteObject = async (key) => {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Generate presigned URL for direct upload from frontend
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @param {number} expiresIn - URL expiration in seconds
 * @returns {Promise<string>}
 */
const getPresignedUploadUrl = async (key, contentType, expiresIn = 3600) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
};

module.exports = {
  uploadFile,
  getObjectUrl,
  deleteObject,
  getPresignedUploadUrl,
  s3Client,
  BUCKET_NAME,
};
