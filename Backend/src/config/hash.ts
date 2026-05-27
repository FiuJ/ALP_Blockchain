import crypto from 'crypto';
import fs from 'fs';

// Helper tambahan jika backend perlu mengecek ulang keaslian file PDF
export const generateFileHash = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return `0x${hashSum.digest('hex')}`;
};