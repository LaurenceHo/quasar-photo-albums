const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const _ = require('lodash');

const queryUserPermission = async (uid) => {
  const usersRef = getFirestore().collection('user-permission');
  const queryResult = await usersRef.where('uid', '==', uid).limit(1).get();
  let userPermission = null;
  queryResult.forEach((doc) => {
    userPermission = doc.data();
  });

  return userPermission;
};

const verifyJwtClaim = async (req, res, next) => {
  const _cleanToken = (message) => {
    res.clearCookie('session');
    return res.status(401).send({
      status: 'Unauthorized',
      message,
    });
  };

  if (req.cookies && req.cookies['__session']) {
    const sessionCookie = req.cookies['__session'];

    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      if (decodedClaims.exp <= Date.now() / 1000) {
        _cleanToken('Session expired. Please login again.');
      }

      req['user'] = await queryUserPermission(decodedClaims.uid);
      next();
    } catch (error) {
      _cleanToken('Authentication failed. Please login.');
    }
  } else {
    _cleanToken('Authentication failed. Please login.');
  }
};

const isAdmin = async (sessionCookie) => {
  let decodedClaims = '';
  let userPermission = null;
  if (sessionCookie) {
    decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    userPermission = await queryUserPermission(decodedClaims.uid);
  }
  return _.get(userPermission, 'role') === 'admin';
};

const setCacheControlHeader = async (req, res, next) => {
  const sessionCookie = req.cookies['__session'] || '';
  try {
    const isUserAdmin = await isAdmin(sessionCookie);
    if (!isUserAdmin) {
      res.set('Cache-control', 'public, max-age=3600');
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'Server error' });
  }
};

exports.queryUserPermission = queryUserPermission;
exports.verifyJwtClaim = verifyJwtClaim;
exports.isAdmin = isAdmin;
exports.setCacheControlHeader = setCacheControlHeader;
