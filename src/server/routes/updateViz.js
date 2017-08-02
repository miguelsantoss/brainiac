import path from 'path';
import fs from 'fs';
import glob from 'glob';
import ncbi from 'node-ncbi';
import PythonShell from 'python-shell';
import express from 'express';

const route = express.Router();

route.post('/updateviz', (req, res) => {
  const files = glob.sync(path.resolve(path.join(__dirname, '/corpus/pubmed/'), '*.txt'));
  files.forEach(d => fs.unlinkSync(d));
  const { docIds } = req.body;
  const pubmed = ncbi.pubmed;
  const infoPromises = [];
  const abstractPromises = [];
  docIds.forEach((doc) => {
    infoPromises.push(pubmed.summary(doc));
    abstractPromises.push(pubmed.abstract(doc));
  });

  const vizInfo = {
    nodes: [],
    links: [],
  };
  Promise.all(infoPromises).then((docs) => {
    Promise.all(abstractPromises).then((abstracts) => {
      docs.forEach((doc, i) => {
        const authors = [];
        const stringSplit = doc.authors.split(', ');
        stringSplit.forEach(author => authors.push({ name: author }));

        const node = {
          id: `pub${doc.pmid}`,
          title: doc.title,
          authors,
          abstract: abstracts[i] ? abstracts[i] : '',
          date: doc.raw.pubdate,
        };

        vizInfo.nodes.push(node);
      });
      const vizInfoWrite = JSON.stringify(vizInfo);
      const writeAbstracts = [];
      abstracts.forEach((abs, i) => {
        writeAbstracts.push(new Promise((resolve, reject) => {
          fs.writeFile(path.resolve(path.join(__dirname, '/corpus/pubmed/'), `pub${docs[i].pmid}.txt`), abs, (err) => {
            if (err) reject(err);
            resolve(abs);
          });
        }));
      });
      const nodeWrite = new Promise((resolve, reject) => {
        fs.writeFile(path.resolve(path.join(__dirname, '/corpus/pubmed/'), 'documents.json'), vizInfoWrite, 'utf8', (err) => {
          if (err) reject(err);
          resolve(vizInfoWrite);
        });
      });
      Promise.all(writeAbstracts).then(() => {
        nodeWrite.then(() => {
          const options = {
            mode: 'text',
            pythonPath: '/usr/bin/python',
            pythonOptions: ['-u'],
            scriptPath: path.resolve(__dirname),
            args: [
              '--path', path.join(__dirname, 'corpus/pubmed'),
              '--node-info', path.resolve(path.join(__dirname, 'corpus/pubmed'), 'documents.json'),
              '--save', path.resolve(path.join(__dirname, 'corpus/pubmed'), 'vizUpdate.json'),
              '--word-list', path.resolve(path.join(__dirname, 'utils'), 'wordsEn.txt'),
            ],
          };
          PythonShell.run('text.py', options, (err, results) => {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            // console.log('results: ', results);
            res.sendFile(path.resolve(path.join(__dirname, 'corpus/pubmed'), 'vizUpdate.json'));
          });
        });
      });
    });
  });
});
