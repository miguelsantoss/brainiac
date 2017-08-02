import path from 'path';
import fs from 'fs';
import express from 'express';
import multer from 'multer';

import pdfIdGenerator from '../utils';

const indexDir = path.join(__dirname, '..');
const docsFolder = path.join(__dirname, '../corpus/pdf/');
console.log(indexDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docsFolder);
  },
  filename: (req, file, cb) => {
    let exists = false;
    let fileName = `${pdfIdGenerator()}.pdf.new`;
    exists = fs.existsSync(docsFolder + fileName);
    while (exists) {
      fileName = `${pdfIdGenerator()}.pdf.new`;
      exists = fs.existsSync(docsFolder + fileName);
    }
    cb(null, fileName);
  },
});

const upload = multer({ storage });
const route = express.Router();

route.get('/', (req, res) => {
  res.sendFile(path.resolve(indexDir, 'document.json'));
});

route.use('/', express.static(docsFolder));

route.get('/:id', (req, res) => {
  const file = `${docsFolder}${req.params.id}.pdf`;
  if (fs.existsSync(file)) {
    res.redirect(`/pdf/${req.params.id}.pdf`);
  } else {
    res.status(404).send('File not found');
  }
});

route.post('/pdf/upload', upload.single('pdf'), (req, res) => {
  console.log(`Uploading file: ${req.file.filename}`);
  res.end();
});

export default route;
