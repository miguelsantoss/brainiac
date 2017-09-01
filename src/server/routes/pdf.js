import path from 'path';
import jsonfile from 'jsonfile';
import fs from 'fs';
import express from 'express';
import multer from 'multer';

import { pdfIdGenerator, readAsync, promiseReflect } from '../utils';

const indexDir = path.join(__dirname, '..');
const docsFolder = path.join(__dirname, '../corpus/pdf/');
const summariesFolder = path.join(__dirname, '../corpus/summary/');

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

const testFunc = async () => {
  const file = path.resolve(indexDir, 'document.json');
  const summaries = [];
  const ids = [];
  jsonfile.readFile(file, (err, obj) => {
    for (let i = 0; i < obj.nodes.length; i += 1) {
      const node = obj.nodes[i];
      const filename = path.resolve(summariesFolder, `${node.id}.txt`);
      summaries.push(readAsync(filename));
      ids.push(node);
    }
    Promise.all(summaries.map(promiseReflect))
      .then(results => {
        const success = results.filter(res => res.status === 'resolved');
        const failed = results.filter(res => res.status === 'rejected');
        for (let i = 0; i < results.length; i += 1) {
          if (results[i].status === 'resolved') {
            ids[i].summary = results[i].v;
          } else {
            ids[i].summary = 'Summary not available';
          }
        }
        res.send(file);
      })
      .catch(err2 => console.error(err2));
  });
};

const upload = multer({ storage });
const route = express.Router();

route.get('/', (req, res) => {
  const file = path.resolve(indexDir, 'document.json');
  const summaries = [];
  jsonfile.readFile(file, (err, obj) => {
    const { nodes } = obj;
    for (let i = 0; i < obj.nodes.length; i += 1) {
      const node = nodes[i];
      summaries.push(
        readAsync(path.resolve(summariesFolder, `${node.id}.txt`)),
      );
    }
    Promise.all(summaries.map(promiseReflect))
      .then(results => {
        for (let i = 0; i < results.length; i += 1) {
          if (results[i].status === 'resolved') {
            nodes[i].summary = results[i].v;
          } else {
            nodes[i].summary = 'Summary not available';
          }
        }
        res.json(obj);
      })
      .catch(err2 => console.error(err2));
  });
  // res.sendFile(path.resolve(indexDir, 'document.json'));
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
