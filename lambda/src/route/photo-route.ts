import express from 'express';
import multer from 'multer';
import { copyObject, deleteObjects, fetchObjectFromS3, uploadObject } from '../services/aws-s3-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';
import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';
import { PhotosRequest } from '../models';
import { isEmpty, isUndefined } from 'lodash';
import { queryPhotoAlbumById, updatePhotoAlbumV2 } from '../services/aws-dynamodb-service';

export const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/:albumId', async (req, res) => {
  const albumId = req.params['albumId'];
  const cdnURL = process.env.IMAGEKIT_CDN_URL;
  try {
    const album = await queryPhotoAlbumById(albumId);
    const s3ObjectContents = await fetchObjectFromS3(albumId, 1000);
    let photos: { url: string; key: string }[] = [];
    if (s3ObjectContents) {
      // Compose photos array from s3ObjectContents
      photos = s3ObjectContents.map((photo) => {
        let url = '';
        let key = '';
        if (photo && photo.Key) {
          url = cdnURL + encodeURI(photo.Key);
          key = photo.Key;
        }
        return { url, key };
      });

      if (isEmpty(album.albumCover)) {
        await updatePhotoAlbumV2({
          ...album,
          albumCover: photos[0].key,
          updatedBy: 'System',
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      // Remove album cover photo
      if (!isEmpty(album.albumCover)) {
        await updatePhotoAlbumV2({
          ...album,
          albumCover: '',
          updatedBy: 'System',
          updatedAt: new Date().toISOString(),
        });
      }
    }
    res.send(photos);
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ status: STATUS_ERROR, message: err.message });
  }
});

router.delete('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const photosRequest = req.body as PhotosRequest;
  const { albumId, photoKeys } = photosRequest;

  if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
    const photoKeysArray = photoKeys.map((photoKey) => `${albumId}/${photoKey}`);
    deleteObjects(photoKeysArray)
      .then((result) => {
        if (result.$metadata.httpStatusCode === 200) {
          console.log('###### Delete photos:', result.Deleted?.map((deleted) => deleted.Key));
          res.send({ status: STATUS_SUCCESS, message: 'Photo deleted' });
        }
      })
      .catch((err: Error) => {
        console.error(err);
        res.status(500).send({ status: STATUS_ERROR, message: err.message });
      });
  } else {
    res.status(400).send({ status: STATUS_ERROR, message: 'No photo needs to be deleted' });
  }
});

router.put('', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const photos = req.body as PhotosRequest;
  const { destinationAlbumId, albumId, photoKeys } = photos;
  if (isUndefined(destinationAlbumId) || isEmpty(destinationAlbumId)) {
    res.status(400).send({ status: STATUS_ERROR, message: 'No destination album' });
  }

  if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
    const promises: Promise<any>[] = [];
    photoKeys.forEach((photoKey) => {
      const sourcePhotoKey = `${albumId}/${photoKey}`;

      const promise = new Promise((resolve, reject) =>
        copyObject(sourcePhotoKey, `${destinationAlbumId}/${photoKey}`)
          .then((result) => {
            if (result.$metadata.httpStatusCode === 200) {
              deleteObjects([sourcePhotoKey])
                .then(() => {
                  console.log('##### Photo moved:', sourcePhotoKey);
                  resolve('Photo moved');
                })
                .catch((err: Error) => {
                  console.error(err);
                  reject(err);
                  res.status(500).send({ status: STATUS_ERROR, message: err.message });
                });
            }
          })
          .catch((err: Error) => {
            console.error(err);
            reject(err);
            res.status(500).send({ status: STATUS_ERROR, message: err.message });
          })
      );

      promises.push(promise);
    });

    try {
      await Promise.all(promises);
      res.send({ status: STATUS_SUCCESS, message: 'Photo moved' });
    } catch (err: any) {
      console.error(err);
      res.status(500).send({
        status: STATUS_ERROR,
        message: err.message,
      });
    }
  } else {
    res.status(400).send({ status: STATUS_ERROR, message: 'No photo needs to be moved' });
  }
});

router.post('/upload/:albumId', verifyJwtClaim, verifyUserPermission, upload.single('file'), async (req, res) => {
  const albumId = req.params['albumId'];

  try {
    const filename = req.file?.originalname;
    const buffer = req.file?.buffer;
    console.log(`##### Uploading file: ${filename}, mimeType: ${req.file?.mimetype}, file size: ${req.file?.size}`);
    const result = await uploadObject(`${albumId}/${filename}`, buffer);
    if (result?.$metadata?.httpStatusCode === 200) {
      res.send({ status: STATUS_SUCCESS });
      console.log(`##### File uploaded: ${filename}`);
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).send({
      status: STATUS_ERROR,
      message: err.message,
    });
  }
});
