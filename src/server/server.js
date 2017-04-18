var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs');

const docsFolder = __dirname + '/../../pdf';

var app = express();
app.use(bodyParser.json());

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Range");
    res.header("Access-Control-Expose-Headers", "Accept-Ranges, Content-Encoding, Content-Length, Content-Range");
    next();
});

app.get('/pdf', function(req, res) {
	fs.readdir(docsFolder, (err, files) => {
		res.sendFile(__dirname + '/document.json');
	});
});

app.use('/pdf', express.static(docsFolder));

app.get('/pdf/:id', function(req, res) {
  const file = docsFolder + '/' +  req.params.id + '.pdf';
  if(fs.existsSync(file)) {
    res.redirect('/pdf/' + req.params.id + '.pdf');
  }
});

// app.get('*', function(req, res) {
//     res.json({ test: "test" });
// });
