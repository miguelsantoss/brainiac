import express from 'express';
import ncbi from 'node-ncbi';
import PythonShell from 'python-shell';

const route = express.Router();

route.get('/', (req, res) => {
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
          if (d) {
            results.papers[i].abstract = d;
          } else {
            results.papers[i].abstract = '';
          }
        });
        res.json(results.papers);
      });
      // res.json(results.papers);
    });
  } else {
    res.send('Specify s and q fields, like /search?q=alzheimer&s=pubmed');
  }
});

route.get('/abstract', (req, res) => {
  if (req.query.s && req.query.s === 'scholar') {
    // todo: google search
  } else if (req.query.id && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.abstract(req.query.id).then(results => res.json(results));
  }
});

route.get('/qc=:query', (req, res) => {
  const pyshell = new PythonShell('spell_checker.py');
  pyshell.send(req.params.query);
  pyshell.on('message', (message) => {
    res.send(message);
  });
});

export default route;
