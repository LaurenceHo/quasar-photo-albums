const path = require('path');
const fs = require('fs');
const helpers = require('../helpers');
const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const os = require('os');

/**
 * https://cloud.google.com/functions/docs/writing/http#multipart_data
 */
router.post('/upload/:albumId', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const albumId = req.params['albumId'];

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();

  const fields = {};
  const uploads = {};
  const fileWrites = [];

  busboy.on('field', (fieldName, val) => {
    console.log(`##### Processed field ${fieldName}: ${val}.`);
    fields[fieldName] = val;
  });

  busboy.on('file', (fieldName, file, { filename }) => {
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    console.log(`##### Processed file ${filename}`);
    const filepath = path.join(tmpdir, filename);
    uploads[fieldName] = filepath;

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    // File was processed by Busboy; wait for it to be written.
    // Note: GCF may not persist saved files across invocations.
    // Persistent files must be kept in other locations
    // (such as Cloud Storage buckets).
    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end();
      });
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    fileWrites.push(promise);
  });

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', async () => {
    await Promise.all(fileWrites);

    /**
     * TODO(developer): Process saved files here, upload to S3 bucket
     */
    for (const file in uploads) {
      fs.unlinkSync(uploads[file]);
    }
    res.send({ status: 'Success' });
  });

  busboy.end(req.rawBody);
});

module.exports = router;
