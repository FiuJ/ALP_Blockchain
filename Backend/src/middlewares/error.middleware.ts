import { Request, Response, NextFunction } from 'express';

// Global error handler agar server tidak crash saat ada error
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server internal',
  });
};