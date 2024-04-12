import { NextFunction, Request, Response } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const asyncHandlerV2 =
  (fn: (request: FastifyRequest, reply: FastifyReply) => any) => (request: FastifyRequest, reply: FastifyReply) =>
    Promise.resolve(fn(request, reply));
