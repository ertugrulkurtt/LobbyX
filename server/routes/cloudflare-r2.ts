import { RequestHandler } from "express";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import { nanoid } from "nanoid";

// Cloudflare R2 Configuration
const R2_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'lobbyxserver',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
  publicDomain: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 'https://cdn.lobbyx.com'
};

// Initialize S3 Client for Cloudflare R2 (R2 is S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * Upload file directly to Cloudflare R2
 */
export const uploadToR2: RequestHandler = async (req, res) => {
  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error', details: err.message });
      }

      const file = req.file;
      const { userId, folder } = req.body;

      if (!file || !userId) {
        return res.status(400).json({ error: 'Missing file or userId' });
      }

      // Generate unique file path
      const timestamp = Date.now();
      const randomId = nanoid(8);
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder || 'misc'}/${userId}/${timestamp}_${randomId}_${cleanFileName}`;

      try {
        // Upload to R2
        const uploadCommand = new PutObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: filePath,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.originalname,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        });

        await r2Client.send(uploadCommand);

        // Generate public URL
        const publicUrl = `${R2_CONFIG.publicDomain}/${filePath}`;
        const storageUrl = `r2://${R2_CONFIG.bucketName}/${filePath}`;

        res.json({
          success: true,
          fileId: `${timestamp}_${randomId}`,
          fileName: file.originalname,
          filePath,
          publicUrl,
          storageUrl,
          fileSize: file.size,
          fileType: file.mimetype,
        });

      } catch (uploadError) {
        console.error('R2 upload error:', uploadError);
        res.status(500).json({ error: 'Failed to upload to R2', details: uploadError.message });
      }
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete file from Cloudflare R2
 */
export const deleteFromR2: RequestHandler = async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'Missing filePath' });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: filePath,
    });

    await r2Client.send(deleteCommand);

    res.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('R2 delete error:', error);
    res.status(500).json({ error: 'Failed to delete from R2' });
  }
};

/**
 * Get presigned URL for direct uploads (for large files)
 */
export const getR2UploadUrl: RequestHandler = async (req, res) => {
  try {
    const { filePath, fileType, userId } = req.body;

    if (!filePath || !fileType || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const putCommand = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: filePath,
      ContentType: fileType,
      Metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await getSignedUrl(r2Client, putCommand, { expiresIn: 3600 });
    const publicUrl = `${R2_CONFIG.publicDomain}/${filePath}`;

    res.json({
      uploadUrl,
      fileUrl: publicUrl,
      filePath,
    });

  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

/**
 * Get file metadata from R2
 */
export const getR2FileMetadata: RequestHandler = async (req, res) => {
  try {
    const { filePath } = req.params;

    const headCommand = new GetObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: filePath,
    });

    const response = await r2Client.send(headCommand);

    res.json({
      fileName: response.Metadata?.originalName || filePath.split('/').pop(),
      fileSize: response.ContentLength,
      fileType: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    });

  } catch (error) {
    console.error('R2 metadata error:', error);
    res.status(404).json({ error: 'File not found' });
  }
};

/**
 * Health check for R2 connection
 */
export const checkR2Health: RequestHandler = async (req, res) => {
  try {
    // Try to list objects (without actually listing, just check connection)
    const testCommand = new GetObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: '_health_check_dummy', // This file doesn't exist, but will test connection
    });

    try {
      await r2Client.send(testCommand);
    } catch (err: any) {
      // NoSuchKey error means connection is working
      if (err.name === 'NoSuchKey') {
        res.json({ status: 'healthy', message: 'R2 connection working' });
        return;
      }
      throw err;
    }

    res.json({ status: 'healthy', message: 'R2 connection working' });

  } catch (error) {
    console.error('R2 health check error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
};

export default {
  uploadToR2,
  deleteFromR2,
  getR2UploadUrl,
  getR2FileMetadata,
  checkR2Health,
};
