import { FastifyReply, FastifyRequest } from 'fastify';

export const asyncHandler =
  (fn: (request: FastifyRequest, reply: FastifyReply) => any) => (request: FastifyRequest, reply: FastifyReply) =>
    Promise.resolve(fn(request, reply));
