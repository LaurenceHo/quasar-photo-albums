import JsonResponse from './json-response';
import { NextFunction, Request, Response } from 'express';
import ErrorResponse from './error-response';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: ErrorResponse, req: Request, res: Response, next: NextFunction) =>
  new JsonResponse(error.code ?? 500).error(res, error.message ?? 'Server error! request not completed');
