const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const serviceAccount = require('./serviceAccountKey.json');
const env = require('dotenv').config().parsed;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const whitelist = ['http://localhost:8080', env.ALBUM_URL];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};
const cors = require('cors')(corsOptions);
const db = getFirestore();

exports.verifyIdToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const token = req.query.token;
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(String(token));
      const usersRef = db.collection('user-permission');
      const queryResult = await usersRef.where('uid', '==', decodedIdToken.uid).get();
      let userPermission = null;
      queryResult.forEach((doc) => {
        userPermission = doc.data();
      });

      if (userPermission && userPermission.role === 'admin') {
        const userRecord = await admin.auth().getUser(decodedIdToken.uid);
        return res.status(200).send(userRecord);
      } else {
        console.log(`User ${decodedIdToken.email} doesn't have permission`);
        return res.status(403).send({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error while getting Firebase User record:', error);
      return res.status(403).send({ error: 'Unauthorized' });
    }
  });
});
