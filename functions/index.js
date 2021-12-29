const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const bodyParser = require('body-parser');
const express = require('express');
const env = require('dotenv').config().parsed;

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const db = getFirestore();

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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/auth/verifyIdToken', async (req, res) => {
  const token = req.body.token;
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(String(token));
    const usersRef = db.collection('user-permission');
    const queryResult = await usersRef.where('uid', '==', decodedIdToken.uid).get();
    let userPermission = null;
    queryResult.forEach((doc) => {
      userPermission = doc.data();
    });

    if (userPermission && userPermission.role === 'admin') {
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
