import express, { Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import admin from 'firebase-admin';
import get from 'lodash/get';
import UserService from '../services/user-service';

// Reference:
// https://firebase.google.com/docs/auth/admin/manage-cookies
// https://firebase.google.com/docs/auth/admin/verify-id-tokens

export const router = express.Router();
const userService = new UserService();

router.get('/userInfo', async (req, res) => {
  try {
    const firebaseToken = get(req, 'cookies.__session', null);
    if (!firebaseToken) {
      res.send({ status: 'Unauthorized', message: 'No auth token provided' });
    } else {
      const { exp, uid, email = '' } = await admin.auth().verifySessionCookie(firebaseToken, true);
      if (exp <= Date.now() / 1000) {
        res.clearCookie('__session');
        res.send({ status: 'Unauthorized', message: 'Auth token expired' });
      } else {
        const userPermission = await userService.findOne({ uid, email });

        res.send(userPermission);
      }
    }
  } catch (error) {
    res.clearCookie('__session');
    res.send({ status: 'Unauthorized', message: 'User is not logged-in' });
  }
});

router.post('/verifyIdToken', async (req, res) => {
  const token = req.body.token; // Firebase ID Token

  try {
    const { uid, auth_time, email = '' } = await admin.auth().verifyIdToken(String(token));
    const userPermission = await userService.findOne({ uid, email });
    // Only process if the authorised user just signed-in in the last 5 minutes.
    if (userPermission && new Date().getTime() / 1000 - auth_time < 5 * 60) {
      // Set idToken as cookies
      await _setCookies(res, token);
      res.send(userPermission);
    } else {
      console.log(`User ${email} doesn't have permission`);
      await admin.auth().revokeRefreshTokens(uid);
      res.status(403).send({ status: 'Unauthorized', message: `User ${email} doesn't have login permission` });
    }
  } catch (err) {
    console.error('Error while getting user permission:', err);
    res.status(403).send({ status: 'Unauthorized', message: 'Error while user login' });
  }
});

router.post('/logout', async (req, res) => {
  const firebaseToken = get(req, 'cookies.__session', '');
  res.clearCookie('__session');
  // @ts-ignore
  req.user = null;
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(firebaseToken);
    admin
      .auth()
      .revokeRefreshTokens(decodedClaims?.sub)
      .then(() => res.sendStatus(200));
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const _setCookies = async (res: Response, token: any) => {
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
