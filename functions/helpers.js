const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

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

  if (req.cookies && req.cookies.session) {
    const sessionCookie = req.cookies.session;

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

exports.queryUserPermission = queryUserPermission;
exports.verifyJwtClaim = verifyJwtClaim;
