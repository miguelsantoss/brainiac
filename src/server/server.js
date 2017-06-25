var express = require("express");
var fs = require('fs');
var cors = require('cors')
var multer = require('multer')
var PythonShell = require('python-shell');
var exec = require('child_process').exec;
var ncbi = require('node-ncbi');

const docs_folder = __dirname + '/corpus/pdf/';
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, docs_folder)
  },
  filename: function (req, file, cb) {
    var exists = false
    var file_name = pdf_id_generator() + '.pdf.new'
    exists = fs.existsSync(docs_folder + file_name)
    while(exists) {
      file_name = pdf_id_generator() + '.pdf.new'
      exists = fs.existsSync(docs_folder + file_name)
    }
    cb(null, file_name)
  }
})

var upload = multer({ storage: storage })

var app = express();
app.use(cors());

var server = app.listen(4000, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

function pdf_id_generator() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  // return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  return ('p'+S4()+S4()+S4()+S4());
}

app.get('/qc=:query', function(req, res) {
  var pyshell = new PythonShell('spell_checker.py');
  pyshell.send(req.params.query);
  pyshell.on('message', function (message) {
    res.send(message);
  });
})

app.get('/search', function(req, res) {
  if(req.query.s && req.query.s === 'scholar') {
    //const scholar = 'python ' + __dirname + '/scholar.py -c 10 --phrase "' + req.query.q + '" --json';
    //exec(scholar, function(error, stdout, stderr) {
    //  const response = JSON.parse(stdout);
    //  res.send(response);
    //});
    res.json([]);
  }
  else if (req.query.s && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.search(req.query.q).then(results => res.json(results.papers));
  }
})

app.get('/docinfo', function(req, res) {
  if(req.query.s && req.query.s === 'scholar') {
  }
  else if (req.query.id && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.summary(req.query.id).then(results => res.json(results));
  }
})

app.get('/abstract', function(req, res) {
  if(req.query.s && req.query.s === 'scholar') {
  }
  else if (req.query.id && req.query.s === 'pubmed') {
    const pubmed = ncbi.pubmed;
    pubmed.abstract(req.query.id).then(results => res.json(results));
  }
})

app.get('/pdf', function(req, res) {
	fs.readdir(docs_folder, (err, files) => {
		res.sendFile(__dirname + '/document.json');
	});
});

app.use('/pdf', express.static(docs_folder));

app.get('/pdf/:id', function(req, res) {
  const file = docs_folder +  req.params.id + '.pdf';
  if(fs.existsSync(file)) {
    res.redirect('/pdf/' + req.params.id + '.pdf');
  }
});

app.post('/pdf/upload', upload.single('pdf'), function (req, res, next) {
  console.log("Uploading file: " + req.file.filename);
  res.end();
})

app.get('*', function(req, res) {
  console.log(req);
  res.send('wrong_request');
});