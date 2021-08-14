import AWS from 'aws-sdk';
import { Actions, ActionType, MutationType, StoreState } from './types';
import { ActionTree } from 'vuex';
import remove from 'lodash/remove';

export const actions: ActionTree<StoreState, StoreState> & Actions = {
  [ActionType.loadingData]({ commit }, payload) {
    commit(MutationType.loadingData, payload);
  },

  [ActionType.getAllAlbumList]({ commit }) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = process.env.AWS_REGION as string; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
    });

    // Create a new service object
    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
    });

    commit(MutationType.loadingData, true);
    s3.listObjectsV2({ Delimiter: '/', Bucket: bucketName }, async (err, data) => {
      if (err) {
        commit(MutationType.loadingData, false);
        return;
      }
      if (data && data.CommonPrefixes) {
        const allAlbumList = data.CommonPrefixes.map((commonPrefix) => {
          const prefix = commonPrefix.Prefix;
          let albumName = '';
          if (prefix) {
            albumName = decodeURIComponent(prefix.replace('/', ''));
          }
          return { albumName };
        });
        remove(
          allAlbumList,
          (album) =>
            album.albumName === 'css' ||
            album.albumName === 'fonts' ||
            album.albumName === 'icons' ||
            album.albumName === 'js'
        );
        allAlbumList.sort((a, b) => {
          const nameA = a.albumName.toLowerCase();
          const nameB = b.albumName.toLowerCase();
          if (nameA < nameB) {
            return 1;
          }
          if (nameA > nameB) {
            return -1;
          }
          return 0;
        });
        commit(MutationType.setAllAlbumList, allAlbumList);
      }
      commit(MutationType.loadingData, false);
    });
  },
};
