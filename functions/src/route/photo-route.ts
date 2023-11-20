import Busboy from 'busboy';
import express from 'express';
import { info, error } from 'firebase-functions/logger';
import { copyObject, deleteObjects, fetchObjectFromS3, uploadObject } from '../services/aws-s3-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';
import { STATUS_ERROR, STATUS_SUCCESS } from '../constants';
import { PhotosRequest } from '../models';
import { isEmpty, isUndefined } from 'lodash';

export const router = express.Router();

router.get('/:albumId', async (req, res) => {
  const albumId = req.params['albumId'];
  const cdnURL = process.env.IMAGEKIT_CDN_URL;
  try {
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
    }
    res.send(photos);
  } catch (err: any) {
    error(err);
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
        info('###### Delete photos:', result);
        res.send({ status: STATUS_SUCCESS, message: 'Photo deleted' });
      })
      .catch((err: Error) => {
        error(err);
        res.status(500).send({ status: STATUS_ERROR, message: err.message });
      });
  } else {
    res.status(400).send({ status: STATUS_ERROR, message: 'No photo needs to be deleted' });
  }
});

router.put('', verifyJwtClaim, verifyUserPermission, (req, res) => {
  const photos = req.body as PhotosRequest;
  const { destinationAlbumId, albumId, photoKeys } = photos;
  if (isUndefined(destinationAlbumId) || isEmpty(destinationAlbumId)) {
    res.status(400).send({ status: STATUS_ERROR, message: 'No destination album' });
  }

  if (!isUndefined(photoKeys) && !isEmpty(photoKeys)) {
    photoKeys.forEach((photoKey) => {
      const sourcePhotoKey = `${albumId}/${photoKey}`;
      copyObject(sourcePhotoKey, `${destinationAlbumId}/${photoKey}`)
        .then((result) => {
          if (result.$metadata.httpStatusCode === 200) {
            deleteObjects([sourcePhotoKey])
              .then(() => {
                info('###### Photo moved:', sourcePhotoKey);
              })
              .catch((err: Error) => {
                error(err);
                res.status(500).send({ status: STATUS_ERROR, message: err.message });
              });
          }
        })
        .catch((err: Error) => {
          error(err);
          res.status(500).send({ status: STATUS_ERROR, message: err.message });
        });
    });
  } else {
    res.status(400).send({ status: STATUS_ERROR, message: 'No photo needs to be moved' });
  }
});
/**
 * https://cloud.google.com/functions/docs/writing/http#multipart_data
 */
router.post('/upload/:albumId', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const albumId = req.params['albumId'];
  const busboy = Busboy({ headers: req.headers });
  const fileWrites: any[] = [];

  busboy.on('file', async (fieldName, file, fileInfo) => {
    const { filename, encoding, mimeType } = fileInfo;
    info(`##### File [${fieldName}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}`);

    file
      .on('data', (buffer) => {
        info(`##### File [${filename}] got ${buffer.length} bytes`);
        const promise = new Promise((resolve, reject) => {
          uploadObject(`${albumId}/${filename}`, buffer)
            .then((result) => {
              info('##### upload result', JSON.stringify(result));
              resolve(result);
            })
            .catch((error) => reject(error));
        });
        fileWrites.push(promise);
      })
      .on('close', () => {
        info(`File [${filename}] done`);
      });
  });

  busboy.on('field', (fieldName, val) => {
    info(`##### Processed field ${fieldName}: ${val}.`);
  });

  busboy.on('finish', async () => {
    try {
      await Promise.all(fileWrites);
      res.send({ status: STATUS_SUCCESS });
    } catch (err: any) {
      error(err);
      res.status(500).send({
        status: STATUS_ERROR,
        message: err.message,
      });
    }
  });

  //@ts-ignore
  busboy.end(req.rawBody);
});
