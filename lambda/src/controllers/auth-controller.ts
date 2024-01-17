import { Request, RequestHandler, Response } from 'express';
import get from 'lodash/get';
import { RequestWithUser, UserPermission } from '../models';
import { cleanCookie, setCookies, verifyIdToken } from '../route/auth-middleware';
import UserService from '../services/user-service';
import { asyncHandler } from '../utils/async-handler';
import { BaseController } from './base-controller';

// Reference:
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

const userService = new UserService();

export default class AuthController extends BaseController {
  // Get user info from token
  findOne: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const token = get(req, 'cookies.jwt', null);
      if (!token) {
        return this.ok(res, 'No auth token provided');
      } else {
        const payload = await verifyIdToken(token);
        const uid = payload?.sub ?? '';
        const email = payload?.email ?? '';

        const userPermission = await userService.findOne({ uid, email });
        return this.ok<UserPermission>(res, 'ok', userPermission);
      }
    } catch (error) {
      console.log(error);
      return cleanCookie(res, 'User is not logged-in');
    }
  });

  verifyIdToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body.token;

    try {
      const payload = await verifyIdToken(token);
      const uid = payload?.sub ?? '';
      const email = payload?.email ?? '';
      const auth_time = payload?.iat ?? 0;

      const userPermission = await userService.findOne({ uid, email });
      // Only process if the authorised user just login in the last 5 minutes.
      if (userPermission && new Date().getTime() / 1000 - auth_time < 5 * 60) {
        // Set token as cookies
        await setCookies(res, token);
        return this.ok<UserPermission>(res, 'ok', userPermission);
      } else {
        console.log(`User ${email} doesn't have permission`);
        return this.unauthorized(res, `User ${email} doesn't have login permission`);
      }
    } catch (err) {
      console.error('Error while getting user permission:', err);
      return this.fail(res, 'Error while user login');
    }
  });

  logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      res.clearCookie('jwt');
      (req as RequestWithUser).user = null;
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
