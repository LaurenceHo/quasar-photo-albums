import { Request, Response } from 'express';
import admin from 'firebase-admin';
import get from 'lodash/get';
import UserService from '../services/user-service';
import { RequestWithUser, ResponseStatus } from '../models';

const userService = new UserService();

/**
 * Clean cookie and return 401
 * @param res
 * @param message
 */
const _cleanCookie = (res: Response, message: string) => {
  res.clearCookie('__session');

  res.status(401).send({
    status: 'Unauthorized',
    message,
  } as ResponseStatus);
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
        _cleanCookie(res, 'User is not logged-in');
      }

      const user = await userService.findOne({ uid, email });
      if (user) {
        (req as RequestWithUser).user = user;
      } else {
        _cleanCookie(res, 'Authentication failed. Please login.');
      }
      next();
    } catch (error) {
      _cleanCookie(res, 'Authentication failed. Please login.');
    }
  } else {
    _cleanCookie(res, 'No auth token provided. Please login.');
  }
};

export const verifyUserPermission = async (req: Request, res: Response, next: any) => {
  if ((req as RequestWithUser).user.role === 'admin') {
    next();
  } else {
    res.status(403).send({ status: 'Unauthorized', message: 'Unauthorized action' } as ResponseStatus);
  }
};
