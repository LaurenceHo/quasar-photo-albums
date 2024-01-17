import { Request, Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import { OAuth2Client } from 'google-auth-library';
import get from 'lodash/get';
import { RequestWithUser } from '../models';
import UserService from '../services/user-service';
import JsonResponse from '../utils/json-response';

const userService = new UserService();
const client = new OAuth2Client();

export const setCookies = async (res: Response, token: any) => {
  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
  const options = {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
  } as CookieOptions;
  res.cookie('jwt', token, options);
  res.setHeader('Cache-Control', 'private');
};

/**
 * Clean cookie and return 401
 * @param res
 * @param message
 */
export const cleanCookie = (res: Response, message: string) => {
  res.clearCookie('jwt');
  return new JsonResponse(401).unauthorized(res, message);
};

/**
 * Verify JWT claim
 * @param req
 * @param res
 * @param next
 */
export const verifyJwtClaim = async (req: Request, res: Response, next: any) => {
  const token = get(req, 'cookies.jwt', null);
  if (token) {
    try {
      const payload = await verifyIdToken(token);
      const uid = payload?.sub ?? '';
      const email = payload?.email ?? '';

      const user = await userService.findOne({ uid, email });
      if (user) {
        (req as RequestWithUser).user = user;
      } else {
        cleanCookie(res, 'Authentication failed. Please login.');
      }
      next();
    } catch (error) {
      cleanCookie(res, 'Authentication failed. Please login.');
    }
  } else {
    new JsonResponse(403).unauthorized(res, 'No auth token provided. Please login.');
  }
};

export const verifyUserPermission = async (req: Request, res: Response, next: any) => {
  if ((req as RequestWithUser).user?.role === 'admin') {
    next();
  } else {
    new JsonResponse(403).unauthorized(res, 'Unauthorized action');
  }
};

export const verifyIdToken = async (token: string) => {
  // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID ?? '',
  });
  return ticket.getPayload();
};
