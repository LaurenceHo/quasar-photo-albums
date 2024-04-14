import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { get } from 'radash';
import { setJwtCookies } from '../routes/auth-middleware.js';
import { UserPermission } from '../schemas/user-permission.js';
import UserService from '../services/user-service.js';
import { BaseController } from './base-controller.js';

// Reference:
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

const userService = new UserService();
const client = new OAuth2Client();

export default class AuthController extends BaseController {
  // Get user info from token
  findOne: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = get(request, 'cookies.jwt', '');
      const result = reply.unsignCookie(token);

      if (!token) {
        return this.ok(reply, 'ok');
      } else {
        if (result.valid && result.value != null) {
          try {
            const decodedPayload = jwt.verify(result.value, process.env.JWT_SECRET as string) as UserPermission;
            return this.ok<UserPermission>(reply, 'ok', decodedPayload);
          } catch (error) {
            reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
            return this.ok(reply, 'ok');
          }
        }

        reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
        return this.ok(reply, 'ok');
      }
    } catch (error) {
      console.log(error);

      reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
      return this.ok(reply, 'ok');
    }
  };

  verifyIdToken: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = (request.body as any).token;

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
          await setJwtCookies(reply, token);
          return this.ok<UserPermission>(reply, 'ok', userPermission);
        } else {
          console.log(`User ${email} doesn't have permission`);
          return this.unauthorized(reply, `User ${email} doesn't have login permission`);
        }
      } else {
        return this.fail(reply, 'Error while user login');
      }
    } catch (err) {
      console.error('Error while getting user permission:', err);
      return this.fail(reply, 'Error while user login');
    }
  };

  logout: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
      (request as any).user = null;

      return this.ok(reply);
    } catch (err) {
      console.error(err);
      return this.fail(reply, '');
    }
  };

  findAll: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  create: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  update: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };

  delete: RouteHandler = async () => {
    throw new Error('Method not implemented.');
  };
}

const _verifyIdToken = async (token: string) => {
  // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID ?? '',
  });
  return ticket.getPayload();
};
