import express from 'express';

import serverless from 'serverless-http';
import { notFoundHandler, termWikiHandler } from './routes';

const app = express();

app.get('/wiki/:term', termWikiHandler);

app.get('*', notFoundHandler);

export const lambdaHandler = serverless(app);
