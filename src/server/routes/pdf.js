import path from 'path';
import jsonfile from 'jsonfile';
import fs from 'fs';
import express from 'express';
import multer from 'multer';
import childProcess from 'child_process';

import { pdfIdGenerator, readAsync, promiseReflect } from '../utils';

const indexDir = path.join(__dirname, '..');
const docsFolder = path.join(__dirname, '../corpus/pdf/');
const corpusFolder = path.join(__dirname, '../corpus/');
const bakFolder = path.join(__dirname, '../bak_corpus/');
const bakFolder2 = path.join(__dirname, '../bak_corpus_case_studies/');
const uploadFolder = docsFolder;
const summariesFolder = path.join(__dirname, '../corpus/summary/');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    let exists = false;
    let fileName = `${pdfIdGenerator()}.pdf`;
    exists = fs.existsSync(docsFolder + fileName);
    while (exists) {
      fileName = `${pdfIdGenerator()}.pdf`;
      exists = fs.existsSync(docsFolder + fileName);
    }
    cb(null, fileName);
  },
});

const upload = multer({ storage });
const route = express.Router();

route.get('/', (req, res) => {
  const file = path.resolve(indexDir, 'vizdata.json');
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
  console.info(file);
  if (fs.existsSync(file)) {
    res.redirect(`/api/pdf/${req.params.id}.pdf`);
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
  const date = JSON.parse(req.body.date);
  let authors = JSON.parse(req.body.authors);
  authors = removeEmptyAuthors(authors);

  fs.readFile(path.join(indexDir, 'document.json'), (err, data) => {
    const obj = JSON.parse(data);
    let lastValue = 0;
    obj.nodes.forEach(d => {
      lastValue = d.value > lastValue ? d.value : lastValue;
    });

    const newFile = {
      title,
      abstract,
      authors,
      date,
      id: req.file.filename.slice(0, -4),
      value: lastValue + 1,
    };
    obj.nodes.push(newFile);

    const objStr = JSON.stringify(obj);
    fs.writeFile(path.join(indexDir, 'document.json'), objStr, 'utf8', () => {
      const convert = childProcess.spawn('sh', [
        `${indexDir}/scripts/runConvertPdfs.sh`,
      ]);
      convert.stdout.on('data', data2 => {
        console.info(`stdout: ${data2}`);
      });
      convert.stderr.on('data', data2 => {
        console.error(`stderr: ${data2}`);
      });
      convert.on('close', () => {
        const p = childProcess.spawn('sh', [
          `${indexDir}/scripts/runTextProcess.sh`,
        ]);
        p.stdout.on('data', data2 => {
          console.info(`stdout: ${data2}`);
        });
        p.stderr.on('data', data2 => {
          console.error(`stderr: ${data2}`);
        });
        p.on('close', () => {
          res.end();
        });
      });
    });
  });
});

const overwriteFromFolder = (orig, dest) => {
  fs.readdir(dest, (err, items) => {
    for (let i = 0; i < items.length; i += 1) {
      fs.unlinkSync(path.join(dest, items[i]));
    }
    fs.readdir(orig, (err2, items2) => {
      for (let i = 0; i < items2.length; i += 1) {
        fs.copyFileSync(path.join(orig, items2[i]), path.join(dest, items2[i]));
      }
    });
  });
};

route.post('/reset-test', (req, res) => {
  // There should be a better way to do this, with
  // like fs-extra to delete/copy the whole folder
  const folders = ['pdf', 'txt', 'summary', 'pubmed'];
  folders.forEach(folder => {
    overwriteFromFolder(
      path.join(bakFolder, `/${folder}/`),
      path.join(corpusFolder, `/${folder}/`),
    );
  });
  fs.unlinkSync(path.join(indexDir, 'document.json'));
  fs.copyFileSync(
    path.join(bakFolder, 'document.json'),
    path.join(indexDir, 'document.json'),
  );
  fs.unlinkSync(path.join(indexDir, 'vizdata.json'));
  fs.copyFileSync(
    path.join(bakFolder, 'vizdata.json'),
    path.join(indexDir, 'vizdata.json'),
  );
  res.json({});
});

route.post('/reset-case-studies', (req, res) => {
  // There should be a better way to do this, with
  // like fs-extra to delete/copy the whole folder
  const folders = ['pdf', 'txt', 'summary', 'pubmed'];
  folders.forEach(folder => {
    overwriteFromFolder(
      path.join(bakFolder2, `/${folder}/`),
      path.join(corpusFolder, `/${folder}/`),
    );
  });
  fs.unlinkSync(path.join(indexDir, 'document.json'));
  fs.copyFileSync(
    path.join(bakFolder2, 'document.json'),
    path.join(indexDir, 'document.json'),
  );
  fs.unlinkSync(path.join(indexDir, 'vizdata.json'));
  fs.copyFileSync(
    path.join(bakFolder2, 'vizdata.json'),
    path.join(indexDir, 'vizdata.json'),
  );
  res.json({});
});

export default route;
