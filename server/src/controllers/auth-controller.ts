import { Request, RequestHandler, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { get } from 'radash';
import { RequestWithUser } from '../models.js';
import { cleanCookie, setCookies } from '../routes/auth-middleware.js';
import { UserPermission } from '../schemas/user-permission.js';
import UserService from '../services/user-service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { BaseController } from './base-controller.js';

// Reference:
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

const userService = new UserService();
const client = new OAuth2Client();

export default class AuthController extends BaseController {
  // Get user info from token
  findOne: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    try {
      const token = get(req, 'cookies.jwt', null);
      if (!token) {
        return this.ok(res, 'ok');
      } else {
        let decodedPayload: any = null;
        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, payload: any) => {
          if (err) {
            res.clearCookie('jwt');
          }
          decodedPayload = payload;
        });

        return this.ok<UserPermission>(res, 'ok', decodedPayload);
      }
    } catch (error) {
      console.log(error);
      return cleanCookie(res, 'Authentication failed. Please login.');
    }
  });

  verifyIdToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body.token;

    try {
      const payload = await _verifyIdToken(token);
      const uid = payload?.sub ?? '';
      const email = payload?.email ?? '';
      const auth_time = payload?.iat ?? 0;

      // Only process if the authorised user just login in the last 5 minutes.
      if (new Date().getTime() / 1000 - auth_time < 5 * 60) {
        const userPermission = await userService.findOne({ uid, email });

        if (userPermission) {
          // Sign JWT token
          const token = jwt.sign(userPermission, process.env.JWT_SECRET as string, { expiresIn: '7d' });
          // Set token as cookies
          await setCookies(res, token);
          return this.ok<UserPermission>(res, 'ok', userPermission);
        } else {
          console.log(`User ${email} doesn't have permission`);
          return this.unauthorized(res, `User ${email} doesn't have login permission`);
        }
      } else {
        return this.fail(res, 'Error while user login');
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

  findAll: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  create: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  update: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });

  delete: RequestHandler = asyncHandler(async () => {
    throw new Error('Method not implemented.');
  });
}

const _verifyIdToken = async (token: string) => {
  // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID ?? '',
  });
  return ticket.getPayload();
};
