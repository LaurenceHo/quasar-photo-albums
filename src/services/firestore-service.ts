import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { firebaseApp } from 'boot/firebase';
import { Album } from 'components/models';
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, where } from 'firebase/firestore';
import { Notify } from 'quasar';

export default class FirestoreService {
  db = getFirestore(firebaseApp);

  async getAlbumList(startIndex?: number, endIndex?: number, filter?: string) {
    // TODO: May need to apply filter in the feature. It only runs filter in the memory atm.
    const albumList: Album[] = [];
    const q = query(
      collection(this.db, 's3-photo-albums'),
      where('private', '==', false),
      orderBy('albumName', 'desc')
    );
    try {
      const queryResult = await getDocs(q);

      queryResult.forEach((doc) => {
        albumList.push(doc.data() as Album);
      });
    } catch (error: any) {
      Notify.create({
        color: 'negative',
        icon: 'mdi-alert-circle-outline',
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
