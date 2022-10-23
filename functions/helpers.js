const _ = require('lodash');
const admin = require('firebase-admin');
const firestoreService = require('./services/firestore-service');

const _cleanCookie = (res, message) => {
  res.clearCookie('__session');
  return res.status(401).send({
    status: 'Unauthorized',
    message,
  });
};

const verifyJwtClaim = async (req, res, next) => {
  if (req.cookies && req.cookies['__session']) {
    try {
      const firebaseToken = _.get(req, 'cookies.__session', '');
      const decodedClaims = await admin.auth().verifySessionCookie(firebaseToken, true);
      if (decodedClaims.exp <= Date.now() / 1000) {
        _cleanCookie(res, 'User is not logged-in');
      }

      const user = await firestoreService.queryUserPermission(decodedClaims?.uid);
      if (user) {
        req['user'] = user;
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

const verifyUserPermission = async (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send({ status: 'Unauthorized', message: 'Unauthorized action' });
  }
};

exports.verifyJwtClaim = verifyJwtClaim;
exports.verifyUserPermission = verifyUserPermission;
