const { getFirestore } = require('firebase-admin/firestore');
const awsS3Service = require('./aws-s3-service');

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
// https://googleapis.dev/nodejs/firestore/latest/Firestore.html

const queryUserPermission = async (uid) => {
  const usersRef = getFirestore().collection('user-permission');
  const queryResult = await usersRef.where('uid', '==', uid).limit(1).get();
  let userPermission = null;
  queryResult.forEach((doc) => {
    userPermission = doc.data();
  });

  return userPermission;
};

const queryPhotoAlbums = async (isAdmin) => {
  const albumList = [];
  const albumRef = getFirestore().collection('s3-photo-albums');
  let queryResult;
  if (isAdmin) {
    queryResult = await albumRef.orderBy('albumName', 'desc').get();
  } else {
    queryResult = await albumRef.where('private', '==', false).orderBy('albumName', 'desc').get();
  }
  queryResult.forEach((doc) => {
    albumList.push({ ...doc.data(), id: doc.id });
  });
  return albumList;
};

const createPhotoAlbum = (album) => {
  // Because we don't want to use auto generated id, we need to use "set" to create document
  // https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#set
  const albumRef = getFirestore().collection('s3-photo-albums').doc(album.id);

  delete album.id;

  return albumRef.set(album);
};

const updatePhotoAlbum = (album) => {
  const albumRef = getFirestore().doc(`s3-photo-albums/${album.id}`);

  return albumRef.update(album);
};

const deletePhotoAlbum = (albumId) => {
  const albumRef = getFirestore().doc(`s3-photo-albums/${albumId}`);
  return albumRef.delete();
};

const queryAlbumTags = async () => {
  const albumTags = [];
  let querySnapshot;

  const docRef = getFirestore().collection('album-tags');
  querySnapshot = await docRef.orderBy('tag', 'asc').get();

  querySnapshot.forEach((doc) => {
    albumTags.push({ ...doc.data(), id: doc.id });
  });
  return albumTags;
};

const createPhotoAlbumTag = (tag) => {
  const tagRef = getFirestore().collection('album-tags').doc(tag.id);

  delete tag.id;

  return tagRef.set(tag);
};

const deletePhotoAlbumTag = (tagId) => {
  const tagRef = getFirestore().doc(`album-tags/${tagId}`);
  return tagRef.delete();
};

const setupDefaultAlbumCover = async (albumList) => {
  for (const album of albumList) {
    if (!album.albumCover) {
      const s3ObjectContents = await awsS3Service.fetchObjectFromS3(album.id, 1);
      if (s3ObjectContents) {
        console.log('Photo key:', s3ObjectContents[0].Key);

        const albumRef = getFirestore().collection('s3-photo-albums').doc(album.id);
        albumRef.update({ ...album, albumCover: s3ObjectContents[0].Key }).then((res) => {
          console.log(`Document updated at ${res.writeTime}`);
        });
      }
    }
  }
};

exports.queryUserPermission = queryUserPermission;

exports.queryPhotoAlbums = queryPhotoAlbums;
exports.createPhotoAlbum = createPhotoAlbum;
exports.updatePhotoAlbum = updatePhotoAlbum;
exports.deletePhotoAlbum = deletePhotoAlbum;

exports.queryAlbumTags = queryAlbumTags;
exports.createPhotoAlbumTag = createPhotoAlbumTag;
exports.deletePhotoAlbumTag = deletePhotoAlbumTag;

exports.setupDefaultAlbumCover = setupDefaultAlbumCover;
