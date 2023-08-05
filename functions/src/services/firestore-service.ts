import { getFirestore } from 'firebase-admin/firestore';
import { info }  from "firebase-functions/logger";
import { fetchObjectFromS3 } from './aws-s3-service';

// Reference:
// https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore
// https://googleapis.dev/nodejs/firestore/latest/Firestore.html

export const queryUserPermission = async (uid: string) => {
  const usersRef = getFirestore().collection('user-permission');
  const queryResult = await usersRef.where('uid', '==', uid).limit(1).get();
  let userPermission = null;
  queryResult.forEach((doc) => {
    userPermission = doc.data();
  });

  return userPermission;
};

export const queryPhotoAlbums = async (isAdmin: boolean) => {
  const albumList: any[] = [];
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

export const createPhotoAlbum = (album: any) => {
  // Because we don't want to use auto generated id, we need to use "set" to create document
  // https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#set
  const albumRef = getFirestore().collection('s3-photo-albums').doc(album.id);

  delete album.id;

  return albumRef.set(album);
};

export const updatePhotoAlbum = (album: any) => {
  const albumRef = getFirestore().doc(`s3-photo-albums/${album.id}`);

  return albumRef.update(album);
};

export const deletePhotoAlbum = (albumId: string) => {
  const albumRef = getFirestore().doc(`s3-photo-albums/${albumId}`);
  return albumRef.delete();
};

export const queryAlbumTags = async () => {
  const albumTags: any[] = [];

  const docRef = getFirestore().collection('album-tags');
  const querySnapshot = await docRef.orderBy('tag', 'asc').get();

  querySnapshot.forEach((doc) => {
    albumTags.push({ ...doc.data(), id: doc.id });
  });
  return albumTags;
};

export const createPhotoAlbumTag = (tag: any) => {
  const tagRef = getFirestore().collection('album-tags').doc(tag.id);

  delete tag.id;

  return tagRef.set(tag);
};

export const deletePhotoAlbumTag = (tagId: string) => {
  const tagRef = getFirestore().doc(`album-tags/${tagId}`);
  return tagRef.delete();
};

export const setupDefaultAlbumCover = async (albumList: any[]) => {
  for (const album of albumList) {
    if (!album.albumCover) {
      const s3ObjectContents = await fetchObjectFromS3(album.id, 1);
      if (s3ObjectContents) {
        console.log('Photo key:', s3ObjectContents[0].Key);

        const albumRef = getFirestore().collection('s3-photo-albums').doc(album.id);
        albumRef.update({ ...album, albumCover: s3ObjectContents[0].Key }).then((res) => {
          info(`Document updated at ${res.writeTime}`);
        });
      }
    }
  }
};
