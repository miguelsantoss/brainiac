import express from 'express';
import search from './search';
import pdf from './pdf';

const routes = express.Router();
routes.use('/search', search);
routes.use('/pdf', pdf);

export default routes;
