const express = require('express');
const admin = require('firebase-admin');
const helpers = require('../helpers');
// Reference:
// https://firebase.google.com/docs/auth/admin/manage-cookies
// https://firebase.google.com/docs/auth/admin/verify-id-tokens

const router = express.Router();
router.get('/userInfo', async (req, res) => {
  const sessionCookie = req.cookies['__session'] || '';
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    if (decodedClaims.exp <= Date.now() / 1000) {
      res.clearCookie('session');
      res.send({ status: 'Unauthorized', message: 'User is not logged-in' });
    }
    const userPermission = await helpers.queryUserPermission(decodedClaims.uid);

    res.send(userPermission);
  } catch (error) {
    res.send({ status: 'Unauthorized', message: 'User is not logged-in' });
  }
});

router.post('/verifyIdToken', async (req, res) => {
  const token = req.body.token;

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(String(token));
    const userPermission = await helpers.queryUserPermission(decodedIdToken.uid);
    // Only process if the authorised user just signed-in in the last 5 minutes.
    if (userPermission && new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      await _setCookies(res, token);
      res.send(userPermission);
    } else {
      console.log(`User ${decodedIdToken.email} doesn't have permission`);
      await admin.auth().revokeRefreshTokens(decodedIdToken.uid);
      res.status(403).send({ status: 'Unauthorized', message: `User ${decodedIdToken.email} doesn't have permission` });
    }
  } catch (error) {
    console.error('Error while getting Firebase User record:', error);
    res.status(403).send({ status: 'Unauthorized', message: 'Error while user login' });
  }
});

const _setCookies = async (res, token) => {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await admin.auth().createSessionCookie(String(token), { expiresIn });
  const options = { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' };
  // It must be "__session" or Google Cloud Functions would not retain it.
  // https://stackoverflow.com/questions/59489994/unable-to-read-cookies-from-the-get-header-in-node-js-express-on-firebase-cloud
  res.cookie('__session', sessionCookie, options);
  res.setHeader('Cache-Control', 'private');
};

module.exports = router;
