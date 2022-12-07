import Busboy from 'busboy';
import express from 'express';
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
    console.log(err);
    res.sendStatus(500);
  }
});

router.delete('/photo', verifyJwtClaim, verifyUserPermission, async (req, res) => {
  const photo = req.body;

  try {
    if (photo) {
      console.log('###### Delete photo:', photo);
      const response = await deleteObject(`${photo.albumId}/${photo.objectKey}`);
      res.send(response);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    console.log(err);
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

  busboy.on('file', async (fieldName, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(`##### File [${fieldName}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}`);

    file
      .on('data', (buffer) => {
        console.log(`##### File [${filename}] got ${buffer.length} bytes`);
        const promise = new Promise((resolve, reject) => {
          uploadObject(`${albumId}/${filename}`, buffer)
            .then((result) => {
              console.log('##### upload result', JSON.stringify(result));
              resolve(result);
            })
            .catch((error) => reject(error));
        });
        fileWrites.push(promise);
      })
      .on('close', () => {
        console.log(`File [${filename}] done`);
      });
  });

  busboy.on('field', (fieldName, val) => {
    console.log(`##### Processed field ${fieldName}: ${val}.`);
  });

  busboy.on('finish', async () => {
    try {
      await Promise.all(fileWrites);
      res.send({ status: 'Success' });
    } catch (error: any) {
      console.log(error);
      res.status(500).send({
        status: 'Server error',
        message: error.toString(),
      });
    }
  });

  //@ts-ignore
  busboy.end(req.rawBody);
});
