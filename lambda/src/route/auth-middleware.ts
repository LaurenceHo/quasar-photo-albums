import { Request, Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import admin from 'firebase-admin';
import get from 'lodash/get';
import UserService from '../services/user-service';
import { RequestWithUser } from '../models';
import JsonResponse from '../utils/json-response';

const userService = new UserService();

export const setCookies = async (res: Response, token: any) => {
  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
  const sessionCookie = await admin.auth().createSessionCookie(String(token), { expiresIn });
  const options = {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  } as CookieOptions;
  res.cookie('__session', sessionCookie, options);
  res.setHeader('Cache-Control', 'private');
};

/**
 * Clean cookie and return 401
 * @param res
 * @param message
 */
export const cleanCookie = (res: Response, message: string) => {
  res.clearCookie('__session');
  return new JsonResponse(401).unauthorized(res, message);
};

/**
 * Verify JWT claim
 * @param req
 * @param res
 * @param next
 */
export const verifyJwtClaim = async (req: Request, res: Response, next: any) => {
  if (req.cookies && req.cookies['__session']) {
    try {
      const firebaseToken = get(req, 'cookies.__session', '');
      const { exp, uid, email = '' } = await admin.auth().verifySessionCookie(firebaseToken, true);
      if (exp <= Date.now() / 1000) {
        cleanCookie(res, 'User is not logged-in');
      }

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
    cleanCookie(res, 'No auth token provided. Please login.');
  }
};

export const verifyUserPermission = async (req: Request, res: Response, next: any) => {
  if ((req as RequestWithUser).user?.role === 'admin') {
    next();
  } else {
    new JsonResponse(403).unauthorized(res, 'Unauthorized action');
  }
};
