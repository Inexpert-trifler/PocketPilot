// src/controllers/upload.controller.ts

import { Response, NextFunction } from 'express';
import { Readable } from 'stream';
import { AuthRequest } from '../types';
import { prisma } from '../config/database';
import { enqueueFileProcessing } from '../queues';
import { sendCreated, sendSuccess } from '../utils/response';
import { FileProcessingError, NotFoundError } from '../utils/errors';
import { UploadType, UploadStatus } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function getMimeType(mimetype: string): UploadType {
  if (mimetype === 'application/pdf') return UploadType.PDF;
  if (mimetype === 'text/csv') return UploadType.CSV;
  return UploadType.IMAGE;
}

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          reject(new FileProcessingError('Cloud upload failed'));
        } else {
          resolve({ url: result.secure_url, key: result.public_id });
        }
      }
    );
    // Use Node's built-in Readable instead of streamifier
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}

export async function uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) throw new FileProcessingError('No file provided');

    const { url, key } = await uploadToCloudinary(
      file.buffer,
      `pocketpilot/${req.user!.id}`
    );

    const upload = await prisma.upload.create({
      data: {
        userId: req.user!.id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageUrl: url,
        storageKey: key,
        type: getMimeType(file.mimetype),
        status: UploadStatus.PENDING,
      },
    });

    const jobId = await enqueueFileProcessing({
      uploadId: upload.id,
      userId: req.user!.id,
      storageUrl: url,
      mimeType: file.mimetype,
      type: upload.type,
    });

    await prisma.upload.update({ where: { id: upload.id }, data: { jobId } });

    sendCreated(res, { upload, jobId }, 'File uploaded and queued for processing');
  } catch (err) { next(err); }
}

export async function getUploadStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const upload = await prisma.upload.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      select: {
        id: true, status: true, originalName: true, type: true,
        processedAt: true, errorMessage: true, createdAt: true,
      },
    });
    if (!upload) throw new NotFoundError('Upload');
    sendSuccess(res, upload);
  } catch (err) { next(err); }
}

export async function listUploads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const uploads = await prisma.upload.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, originalName: true, status: true, type: true,
        sizeBytes: true, processedAt: true, createdAt: true,
      },
    });
    sendSuccess(res, uploads);
  } catch (err) { next(err); }
}
