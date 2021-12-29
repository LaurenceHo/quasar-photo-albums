const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser');
const env = require('dotenv').config().parsed;

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const corsHeader = (req, res, next) => {
  const allowedOrigins = ['http://localhost:8080', env.ALBUM_URL];
  const origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
app.use(corsHeader);

app.post('/auth/checkUser', async (req, res) => {
  const sessionCookie = req.cookies.session || '';
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const userPermission = await _queryUserPermission(decodedClaims.uid);

    if (userPermission && userPermission.role === 'admin') {
      return res.status(200).send(userPermission);
    } else {
      return res.status(403).send({ status: 'Unauthorized' });
    }
  } catch (error) {
    return res.status(403).send({ status: 'Unauthorized' });
  }
});

app.post('/auth/verifyIdToken', async (req, res) => {
  const token = req.body.token;

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(String(token));
    const userPermission = await _queryUserPermission(decodedIdToken.uid);
    if (userPermission && userPermission.role === 'admin') {
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

exports.api = functions.https.onRequest(app);

const _queryUserPermission = async (uid) => {
  const db = getFirestore();
  const usersRef = db.collection('user-permission');
  const queryResult = await usersRef.where('uid', '==', uid).limit(1).get();
  let userPermission = null;
  queryResult.forEach((doc) => {
    userPermission = doc.data();
  });

  return userPermission;
};

const _setCookies = async (res, token) => {
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await admin.auth().createSessionCookie(String(token), { expiresIn });
  const options = { maxAge: expiresIn, httpOnly: true, secure: true };
  res.cookie('session', sessionCookie, options);
};
