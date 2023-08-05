import Busboy from 'busboy';
import express from 'express';
import { info, error }  from "firebase-functions/logger";
import { deleteObject, fetchObjectFromS3, uploadObject } from '../services/aws-s3-service';
import { verifyJwtClaim, verifyUserPermission } from './helpers';

export const router = express.Router();

router.get('/:albumId', async (req, res) => {
  const albumId = req.params['albumId'];
  const cdnURL = process.env.IMAGEKIT_CDN_URL;
  try {
    const s3ObjectContents = await fetchObjectFromS3(albumId, 1000);
    let photos: any[] = [];
    if (s3ObjectContents) {
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
  } catch (err) {
    error(err);
    res.sendStatus(500);
  }
});

router.delete('/photo', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const photo = req.body;

  try {
    if (photo) {
      info('###### Delete photo:', photo);
      const response = await deleteObject(`${photo.albumId}/${photo.objectKey}`);
      res.send(response);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    error(err);
    res.sendStatus(500);
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
      res.send({ status: 'Success' });
    } catch (err) {
      error(err);
      res.status(500).send({
        status: 'Server error',
        message: error.toString(),
      });
    }
  });

  //@ts-ignore
  busboy.end(req.rawBody);
});
