import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { firebaseApp } from 'src/boot/firebase';
import { Album } from 'src/components/models';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { Notify } from 'quasar';

/**
 * Deprecated - Don't call firestore directly anymore
 */
export default class FirestoreService {
  db = getFirestore(firebaseApp);

  async getAlbumList(publicAlbumOnly: boolean, startIndex?: number, endIndex?: number, filter?: string) {
    // TODO: May need to apply filter in the feature. It only runs filter in the memory atm.
    const albumList: Album[] = [];
    let q;
    if (publicAlbumOnly) {
      q = query(collection(this.db, 's3-photo-albums'), where('private', '==', false), orderBy('albumName', 'desc'));
    } else {
      q = query(collection(this.db, 's3-photo-albums'), orderBy('albumName', 'desc'));
    }
    try {
      const queryResult = await getDocs(q);

      queryResult.forEach((doc) => {
        albumList.push(doc.data() as Album);
      });
    } catch (error: any) {
      Notify.create({
        color: 'negative',
        icon: 'mdi-alert-circle',
        message: error.toString(),
      });
    }
    return albumList;
  }

  async getAlbumTags() {
    const docRef = doc(this.db, 'album-tags', 'album-tags');
    return await getDoc(docRef)
      .then((doc) => doc.data() as { tags: string[] })
      .catch((error) => {
        throw error;
      });
  }

  async updateAlbum(album: Album) {
    console.log('auth', getAuth());
    const batch = writeBatch(this.db);
    const albumRef = doc(this.db, 's3-photo-albums', album.albumName);
    batch.update(albumRef, { albumName: album.albumName, desc: album.desc, private: album.private, tags: album.tags });
    await batch.commit();
  }

  async deleteAlbum(albumName: string) {
    console.log('auth', getAuth());
    const batch = writeBatch(this.db);
    const albumRef = doc(this.db, 's3-photo-albums', albumName);
    batch.delete(albumRef);
    await batch.commit();
  }

  async insertAllAlbumsData() {
    const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

    const s3client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: process.env.AWS_REGION as string }),
        identityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
      }),
    });

    const command = new ListObjectsV2Command({ Delimiter: '/', Bucket: bucketName });
    try {
      const data = await s3client.send(command);
      if (data && data.CommonPrefixes) {
        const allAlbumList = data.CommonPrefixes.map((commonPrefix) => {
          const prefix = commonPrefix.Prefix;
          let albumName = '';
          if (prefix) {
            albumName = decodeURIComponent(prefix.replace('/', ''));
          }
          return { albumName };
        });

        // Insert data to Google Firebase
        for (const album of allAlbumList) {
          await setDoc(doc(this.db, 's3-photo-albums', album.albumName), {
            albumName: album.albumName,
            desc: '',
            tags: [],
            private: false,
          }).catch((error) => {
            throw error;
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
