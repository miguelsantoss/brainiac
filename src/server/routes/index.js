import express from 'express';
import search from './search';
import pdf from './pdf';
import updateViz from './updateViz';

const routes = express.Router();
routes.use('/search', search);
routes.use('/pdf', pdf);
routes.use('/update-viz', updateViz);

export default routes;
