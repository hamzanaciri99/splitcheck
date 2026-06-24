import { Router } from 'express';
import { db } from '../db/client';
import { attachments } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../errors';
import { upload } from '../upload';
import { extractReceiptItems } from '../receiptExtraction';

export const receiptsRouter = Router();
receiptsRouter.use(requireAuth);

receiptsRouter.post('/receipts/scan', upload.single('file'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');

  const [attachment] = await db
    .insert(attachments)
    .values({
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
    })
    .returning();

  const extracted = await extractReceiptItems(req.file.path, req.file.mimetype).catch((err) => {
    console.error('Receipt extraction failed:', err);
    return null;
  });

  res.status(201).json({ attachmentId: attachment.id, url: attachment.url, extracted });
});
