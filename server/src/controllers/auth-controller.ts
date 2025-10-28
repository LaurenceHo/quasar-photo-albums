import { FastifyReply, FastifyRequest, RouteHandler } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import logger from 'pino';
import { get } from 'radash';
import { setJwtCookies } from '../routes/auth-middleware.js';
import { UserPermission } from '../schemas/user-permission.js';
import { BaseController } from './base-controller.js';

// Reference:
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
// Google OAuth client
const client = new OAuth2Client();

// Helper: safe fetch with timeout and error parsing
async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    clearTimeout(timeout);
    return response;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request to D1 worker timed out');
    }
    throw err;
  }
}

export default class AuthController extends BaseController {
  // GET /api/auth/userInfo
  readUserInfoFromToken: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = get(request, 'cookies.jwt', '');
      const result = reply.unsignCookie(token);

      if (!token || !result.valid || !result.value) {
        reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
        return this.ok(reply, 'ok');
      }

      try {
        const decoded = jwt.verify(result.value, process.env['JWT_SECRET']!) as UserPermission;
        return this.ok<UserPermission>(reply, 'ok', decoded);
      } catch (error) {
        logger().info('Invalid JWT:', error);
        reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
        return this.ok(reply, 'ok');
      }
    } catch (error: any) {
      logger().info('Error reading JWT:', error);
      reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
      return this.ok(reply, 'ok');
    }
  };

  // POST /api/auth/verifyIdToken
  verifyIdToken: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, state } = request.body as { token: string; state?: string };

    try {
      // 1. Verify Google ID token
      const payload = await _verifyIdToken(token);
      const uid = payload?.sub ?? '';
      const email = payload?.email ?? '';
      const auth_time = payload?.iat ?? 0;

      if (!uid || !email) {
        return this.unauthorized(reply, 'Invalid Google token');
      }

      // 2. CSRF check
      const storedState = (request.cookies as any).csrf_state;
      if (state !== storedState) {
        logger().info(`CSRF state mismatch: ${state} vs ${storedState}`);
        return this.unauthorized(reply, 'CSRF token mismatch');
      }

      // 3. Fresh login (last 5 minutes)
      const now = Date.now() / 1000;
      if (now - auth_time >= 5 * 60) {
        return this.fail(reply, 'Login session expired');
      }

      // 4. Call D1 Worker to get user permissions
      const workerUrl = process.env['WORKER_URL'];
      const environment = process.env['ENVIRONMENT'] || 'dev';

      if (!workerUrl) {
        logger().error('WORKER_URL not configured');
        return this.fail(reply, 'Server configuration error');
      }

      const response = await safeFetch(`${workerUrl}/user_permissions`, {
        method: 'GET',
        headers: {
          'X-Uid': uid,
          'X-Email': email,
          'X-Environment': environment,
        },
      });

      if (response.status === 200) {
        const userPermission = (await response.json()) as UserPermission;

        // 5. Sign JWT and set cookies
        const jwtToken = jwt.sign(userPermission, process.env['JWT_SECRET']!, {
          expiresIn: '7d',
        });

        await setJwtCookies(reply, jwtToken);
        return this.ok<UserPermission>(reply, 'ok', userPermission);
      } else if (response.status === 404) {
        logger().info(`User ${email} not found in permissions`);
        return this.unauthorized(reply, 'User not authorized');
      } else {
        const text = await response.text();
        logger().error(`D1 worker error ${response.status}: ${text}`);
        return this.fail(reply, 'Failed to verify permissions');
      }
    } catch (err: any) {
      logger().error('Error in verifyIdToken:', err);
      return this.fail(reply, 'Authentication failed');
    }
  };

  // POST /api/auth/logout
  logout: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.setCookie('jwt', '', { maxAge: 0, path: '/' });
      (request as any).user = null;
      return this.ok(reply, 'Logged out');
    } catch (err: any) {
      logger().error('Logout error:', err);
      return this.fail(reply, 'Logout failed');
    }
  };

  // Stub methods
  findOne: RouteHandler = async () => {
    throw new Error('Not implemented');
  };
  findAll: RouteHandler = async () => {
    throw new Error('Not implemented');
  };
  create: RouteHandler = async () => {
    throw new Error('Not implemented');
  };
  update: RouteHandler = async () => {
    throw new Error('Not implemented');
  };
  delete: RouteHandler = async () => {
    throw new Error('Not implemented');
  };
}

// Verify Google ID token
const _verifyIdToken = async (token: string) => {
  const clientId = process.env['VITE_GOOGLE_CLIENT_ID'];
  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID not configured');
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  return ticket.getPayload();
};
