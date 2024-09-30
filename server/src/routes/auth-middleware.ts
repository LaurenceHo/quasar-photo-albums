import { FastifyAuthFunction } from '@fastify/auth';
import { CookieSerializeOptions } from '@fastify/cookie';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { get } from 'radash';
import { UserPermission } from '../schemas/user-permission';
import { RequestWithUser } from '../types/models.js';
import JsonResponse from '../utils/json-response.js';

export const setJwtCookies = async (reply: FastifyReply, token: string) => {
  const expiresIn = 1000 * 60 * 60 * 24 * 7; // 7 days
  const options: CookieSerializeOptions = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true,
    secure: true,
    signed: true,
    path: '/'
  };
  reply.setCookie('jwt', token, options);
  reply.header('Cache-Control', 'private');
};

/**
 * Clean cookie and return 401
 * @param reply FastifyReply
 * @param message Message to return
 * @param code HTTP status code
 */
export const cleanJwtCookie = (reply: FastifyReply, message: string, code = 401) => {
  reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
  return new JsonResponse(code).unauthorized(reply, message);
};

/**
 * Verify JWT claim
 * @param request
 * @param reply
 * @param done
 */
export const verifyJwtClaim: FastifyAuthFunction = async (request: FastifyRequest, reply: FastifyReply, done: any) => {
  const token = get(request, 'cookies.jwt', '');
  const result = reply.unsignCookie(token);
  if (result.valid && result.value != null) {
    try {
      (request as RequestWithUser).user = jwt.verify(
        result.value,
        process.env['JWT_SECRET'] as string
      ) as UserPermission;
    } catch (error) {
      reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
      done(new Error('Authentication failed. Please login.'));
    }
  } else {
    reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
    done(new Error('Authentication failed. Please login.'));
  }
};

export const verifyUserPermission: FastifyAuthFunction = async (
  request: FastifyRequest,
  _reply: FastifyReply,
  done: any
) => {
  if ((request as RequestWithUser).user?.role !== 'admin') {
    done(new Error('Unauthorized action'));
  }
};
