import path from 'path';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import compression from 'compression';
import morgan from 'morgan';
import PythonShell from 'python-shell';
import ncbi from 'node-ncbi';

import pdfIdGenerator from './utils';

const docsFolder = path.join(__dirname, '/corpus/pdf/');
const exec = require('child_process').exec; // eslint-disable-line no-unused-vars

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

const app = express();
app.use(cors());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}


const server = app.listen(4000, () => {
  const port = server.address().port;
  console.log(`App now running on port ${port}`);
});

// Generic error handler used by all endpoints.
const handleError = (res, reason, message, code) => { // eslint-disable-line no-unused-vars
  console.log(`ERROR: ${reason}`);
  res.status(code || 500).json({ error: message });
};

app.get('/qc=:query', (req, res) => {
  const pyshell = new PythonShell('spell_checker.py');
  pyshell.send(req.params.query);
  pyshell.on('message', (message) => {
    res.send(message);
  });
});

app.get('/search', (req, res) => {
  if (req.query.s && req.query.s === 'scholar') {
    // eslint-disable-next-line max-len
    // const scholar = 'python ' + __dirname + '/scholar.py -c 10 --phrase "' + req.query.q + '" --json';
    // exec(scholar, function(error, stdout, stderr) {
    //   const response = JSON.parse(stdout);
    //   res.send(response);
    // });
    res.json([]);
  } else if (req.query.s && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.search(req.query.q).then((results) => {
      const abstractPromises = [];
      results.papers.forEach((d) => {
        abstractPromises.push(pubmed.abstract(d.pmid));
      });
      Promise.all(abstractPromises).then((abstractResults) => {
        abstractResults.forEach((d, i) => {
          results.papers[i].abstract = d;
        });
        res.json(results.papers);
      });
      // res.json(results.papers);
    });
  } else {
    res.send('Specify s and q fields, like /search?q=alzheimer&s=pubmed');
  }
});

app.get('/docinfo', (req, res) => {
  if (req.query.s && req.query.s === 'scholar') {
    // todo: doc info google search
  } else if (req.query.id && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.summary(req.query.id).then(results => res.json(results));
  } else {
    res.send('Specify s and id fields, like /docinfo?id=1234567&s=pubmed');
  }
});

app.get('/abstract', (req, res) => {
  if (req.query.s && req.query.s === 'scholar') {
    // todo: google search
  } else if (req.query.id && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.abstract(req.query.id).then(results => res.json(results));
  }
});

app.get('/pdf', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'document.json'));
});

app.use('/pdf', express.static(docsFolder));

app.get('/pdf/:id', (req, res) => {
  const file = `${docsFolder}${req.params.id}.pdf`;
  if (fs.existsSync(file)) {
    res.redirect(`/pdf/${req.params.id}.pdf`);
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/pdf/upload', upload.single('pdf'), (req, res) => {
  console.log(`Uploading file: ${req.file.filename}`);
  res.end();
});

app.get('*', (req, res) => {
  res.send('wrong_request');
});
