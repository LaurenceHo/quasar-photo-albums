const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const helpers = require('./helpers');

// Reference:
// https://firebase.google.com/docs/auth/admin/manage-cookies
// https://firebase.google.com/docs/auth/admin/verify-id-tokens

router.post('/auth/getUserInfo', async (req, res) => {
  const sessionCookie = req.cookies.session || '';
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    if (decodedClaims.exp <= Date.now() / 1000) {
      res.clearCookie('session');
      return res.status(200).send({ status: 'Unauthorized', message: 'User is not logged-in' });
    }
    const userPermission = await helpers.queryUserPermission(decodedClaims.uid);

    return res.status(200).send(userPermission);
  } catch (error) {
    return res.status(200).send({ status: 'Unauthorized', message: 'User is not logged-in' });
  }
});

router.post('/auth/verifyIdToken', async (req, res) => {
  const token = req.body.token;

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(String(token));
    const userPermission = await helpers.queryUserPermission(decodedIdToken.uid);
    // Only process if the authorised user just signed-in in the last 5 minutes.
    if (userPermission && new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
      await _setCookies(res, token);
      return res.status(200).send(userPermission);
    } else {
      console.log(`User ${decodedIdToken.email} doesn't have permission`);
      await admin.auth().revokeRefreshTokens(decodedIdToken.uid);
      return res
        .status(403)
        .send({ status: 'Unauthorized', message: `User ${decodedIdToken.email} doesn't have permission` });
    }
  } catch (error) {
    console.error('Error while getting Firebase User record:', error);
    return res.status(403).send({ status: 'Unauthorized', message: 'Error while user login' });
  }
});

const _setCookies = async (res, token) => {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await admin.auth().createSessionCookie(String(token), { expiresIn });
  const options = { maxAge: expiresIn, httpOnly: true, secure: true };
  res.cookie('session', sessionCookie, options);
};

module.exports = router;
