import { Request, Response } from 'express';
import admin from 'firebase-admin';
import _ from 'lodash';
import { queryUserPermission } from '../services/firestore-service';

const _cleanCookie = (res: Response, message: string) => {
  res.clearCookie('__session');
  return res.status(401).send({
    status: 'Unauthorized',
    message,
  });
};

export const verifyJwtClaim = async (req: Request, res: Response, next: any) => {
  if (req.cookies && req.cookies['__session']) {
    try {
      const firebaseToken = _.get(req, 'cookies.__session', '');
      const decodedClaims = await admin.auth().verifySessionCookie(firebaseToken, true);
      if (decodedClaims.exp <= Date.now() / 1000) {
        _cleanCookie(res, 'User is not logged-in');
      }

      const user = await queryUserPermission(decodedClaims?.uid);
      if (user) {
        // @ts-ignore
        req.user = user;
      } else {
        _cleanCookie(res, 'Authentication failed. Please login.');
      }
      next();
    } catch (error) {
      _cleanCookie(res, 'Authentication failed. Please login.');
    }
  } else {
    _cleanCookie(res, 'Authentication failed. Please login.');
  }
};

export const verifyUserPermission = async (req: Request, res: Response, next: any) => {
  // @ts-ignore
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send({ status: 'Unauthorized', message: 'Unauthorized action' });
  }
};
