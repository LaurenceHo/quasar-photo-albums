const Busboy = require('busboy');
const express = require('express');

const helpers = require('../helpers');
const awsS3Service = require('../services/aws-s3-service');

const router = express.Router();

router.get('/:albumId', async (req, res) => {
  const albumId = req.params['albumId'];
  const cdnURL = process.env.IMAGEKIT_CDN_URL;
  try {
    const s3ObjectContents = await awsS3Service.fetchObjectFromS3(albumId, 1000);
    let photos = [];
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

/**
 * https://cloud.google.com/functions/docs/writing/http#multipart_data
 */
router.post('/upload/:albumId', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const idTokenCookies = helpers.getTokenFromCookies(req, 'google');
  const albumId = req.params['albumId'];

  const busboy = Busboy({ headers: req.headers });
  const fileWrites = [];

  busboy.on('file', async (fieldName, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(`##### File [${fieldName}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}`);

    const promise = new Promise((resolve, reject) => {
      awsS3Service
        .uploadObject(idTokenCookies, `${albumId}/${filename}`, file)
        .then((result) => {
          console.log('##### upload result', result);
          resolve(result);
        })
        .catch((error) => reject(error));
    });
    fileWrites.push(promise);

    file
      .on('data', (buffer) => {
        console.log(`##### File [${filename}] got ${buffer.length} bytes`);
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
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: 'Server error',
        message: error.toString(),
      });
    }
  });

  busboy.end(req.rawBody);
});
module.exports = router;
