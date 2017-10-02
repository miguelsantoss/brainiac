import path from 'path';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import routes from './routes';
import config from '../config';

const publicFolder = path.join(__dirname, '../../build');

const app = express();
if (app.get('env') === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(compression());
app.use(bodyParser.json());
app.use(express.static(publicFolder));
app.use('/api', routes);

const server = app.listen(config.port, () => {
  const port = server.address().port;
  console.info(`App now running on port ${port}`);
});

// app.get('*', (req, res) => {
//   const parser = new xml2js.Parser();
//   fs.readFile(
//     path.resolve(
//       path.join(__dirname, 'bak_corpus/pdf/refs'),
//       'p0a9650062ef6b287.references.tei.xml',
//     ),
//     (err, data) => {
//       parser.parseString(data, (err2, result) => {
//         console.info(result);
//         console.info('Done');
//         res.json(result);
//       });
//     },
//   );
//   res.status(404);
// });
