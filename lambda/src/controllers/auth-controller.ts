import { Request, RequestHandler, Response } from 'express';
import get from 'lodash/get';
import admin from 'firebase-admin';
import { RequestWithUser, UserPermission } from '../models';
import { cleanCookie, setCookies } from '../route/auth-middleware';
import UserService from '../services/user-service';
import { asyncHandler } from '../utils/async-handler';
import { BaseController } from './base-controller';

// Reference:
// https://firebase.google.com/docs/auth/admin/manage-cookies
// https://firebase.google.com/docs/auth/admin/verify-id-tokens

const userService = new UserService();

export default class AuthController extends BaseController {
  // Get user info from firebase token
  findOne: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const firebaseToken = get(req, 'cookies.__session', null);
      if (!firebaseToken) {
        return this.ok(res, 'No auth token provided');
      } else {
        const { exp, uid, email = '' } = await admin.auth().verifySessionCookie(firebaseToken, true);
        if (exp <= Date.now() / 1000) {
          return cleanCookie(res, 'Auth token expired');
        } else {
          const userPermission = await userService.findOne({ uid, email });
          return this.ok<UserPermission>(res, 'ok', userPermission);
        }
      }
    } catch (error) {
      return cleanCookie(res, 'User is not logged-in');
    }
  });

  verifyIdToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body.token; // Firebase ID Token

    try {
      const { uid, auth_time, email = '' } = await admin.auth().verifyIdToken(String(token));
      const userPermission = await userService.findOne({ uid, email });
      // Only process if the authorised user just signed-in in the last 5 minutes.
      if (userPermission && new Date().getTime() / 1000 - auth_time < 5 * 60) {
        // Set idToken as cookies
        await setCookies(res, token);
        return this.ok<UserPermission>(res, 'ok', userPermission);
      } else {
        console.log(`User ${email} doesn't have permission`);
        await admin.auth().revokeRefreshTokens(uid);
        return this.unauthorized(res, `User ${email} doesn't have login permission`);
      }
    } catch (err) {
      console.error('Error while getting user permission:', err);
      return this.fail(res, 'Error while user login');
    }
  });

  logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const firebaseToken = get(req, 'cookies.__session', '');
    res.clearCookie('__session');
    (req as RequestWithUser).user = null;
    try {
      const decodedClaims = await admin.auth().verifySessionCookie(firebaseToken);
      await admin.auth().revokeRefreshTokens(decodedClaims?.sub);
      return this.ok(res);
    } catch (err) {
      console.error(err);
      return this.fail(res, '');
    }
  });

  findAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    throw new Error('Method not implemented.');
  });
}
