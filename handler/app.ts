import express from 'express';

import serverless from 'serverless-http';
import { notFoundHandler, searchHandler, homeHandler } from './routes';

import path from 'path';

const app = express();

// eslint-disable-next-line @typescript-eslint/no-var-requires
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');

app.get('/', homeHandler);

app.get('/wiki/:term', searchHandler);

app.get('*', notFoundHandler);

export const lambdaHandler = serverless(app);
