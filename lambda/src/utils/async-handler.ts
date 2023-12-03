import { Request, Response } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: any) => any) => (req: Request, res: Response, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
