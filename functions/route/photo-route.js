const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const helpers = require('../helpers');
const express = require('express');
const router = express.Router();

const folder = path.join(__dirname, 'files');

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}

router.post('/upload/:albumId', helpers.verifyJwtClaim, helpers.verifyUserPermission, async (req, res) => {
  const albumId = req.params['albumId'];

  // TODO, receive files and send them to s3
  const form = new formidable.IncomingForm();

  form.uploadDir = folder;
  form.parse(req, (_, fields, files) => {
    console.log('\n-----------');
    console.log('Fields', fields);
    console.log('Received:', Object.keys(files));
    console.log();
    res.send('Thank you');
  });
});

module.exports = router;
