import { FastifyAuthFunction } from '@fastify/auth';
import { CookieSerializeOptions } from '@fastify/cookie';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { get } from 'radash';
import { RequestWithUser } from '../models.js';
import JsonResponse from '../utils/json-response.js';

export const setJwtCookies = async (reply: FastifyReply, token: string) => {
  const expiresIn = 1000 * 60 * 60 * 24 * 7; // 7 days
  const options: CookieSerializeOptions = {
    expires: new Date(Date.now() + expiresIn),
    httpOnly: true,
    secure: true,
    signed: true,
    path: '/',
  };
  reply.setCookie('jwt', token, options);
  reply.header('Cache-Control', 'private');
};

/**
 * Clean cookie and return 401
 * @param reply
 * @param message
 */
export const cleanCookie = (reply: FastifyReply, message: string) => {
  reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
  return new JsonResponse(401).unauthorized(reply, message);
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
  if (result.valid) {
    try {
      jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, payload: any) => {
        if (err) {
          cleanCookie(reply, 'Authentication failed. Please login.');
        }

        (request as RequestWithUser).user = payload;
        done();
      });
    } catch (error) {
      cleanCookie(reply, 'Authentication failed. Please login.');
    }
  } else {
    new JsonResponse(403).unauthorized(reply, 'No auth token provided. Please login.');
  }
};

export const verifyUserPermission: FastifyAuthFunction = async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: any
) => {
  if ((request as RequestWithUser).user?.role !== 'admin') {
    return new JsonResponse(403).unauthorized(reply, 'Unauthorized action');
  } else {
    done();
  }
};
