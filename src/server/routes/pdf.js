import path from 'path';
import jsonfile from 'jsonfile';
import fs from 'fs';
import express from 'express';
import multer from 'multer';

import { pdfIdGenerator, readAsync, promiseReflect } from '../utils';

const indexDir = path.join(__dirname, '..');
const docsFolder = path.join(__dirname, '../corpus/pdf/');
const uploadFolder = path.join(__dirname, '../t/');
const summariesFolder = path.join(__dirname, '../corpus/summary/');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
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

route.post('/upload', upload.single('pdf'), (req, res) => {
  console.info(`Uploading file: ${req.file.filename}`);
  const removeEmptyAuthors = array => {
    const authors = [];
    for (let i = 0; i < array.length; i += 1) {
      if (array[i].name !== '') {
        authors.push(array[i]);
      }
    }
    return authors;
  };
  const title = JSON.parse(req.body.title);
  const abstract = JSON.parse(req.body.abstract);
  let authors = JSON.parse(req.body.authors);

  authors = removeEmptyAuthors(authors);
  console.info(title);
  console.info(abstract);
  console.info(authors);
  res.end();
});

export default route;
