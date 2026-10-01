import multer from 'multer';

// 10MB max in-memory buffer limit
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});
