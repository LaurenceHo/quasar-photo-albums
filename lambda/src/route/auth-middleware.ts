import { Request, Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import get from 'lodash/get';
import { RequestWithUser } from '../models';
import JsonResponse from '../utils/json-response';

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
      jwt.verify(token, process.env.JWT_SECRECT as string, async (err: any, payload: any) => {
        if (err) {
          cleanCookie(res, 'Authentication failed. Please login.');
        }

        (req as RequestWithUser).user = payload;
        next();
      });
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
