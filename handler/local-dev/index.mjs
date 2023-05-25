/* eslint-disable prettier/prettier */
import express from 'express';

import path from 'path';

const app = express();
const port = 3000;
import { fileURLToPath } from 'url';

import { __express } from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('.html', __express);
app.set('views', path.join(__dirname, '../', 'views'));
app.use(express.static(path.join(__dirname, '../', 'public')));
app.set('view engine', 'html');

app.get('/', async (_, res) => {
  res.render('home', {
    title: 'HOME',
    baseUrl: "test.com/wiki/",
  });
});

app.get('/wiki/Albert_Einstein', async (_, res) => {
  const searchTerm = 'Albert Einstein';
  res.render('result', {
    title: searchTerm,
    term: searchTerm,
    summary: `Albert Einstein was a very smart man who was born in Germany. He learned a lot about math and science and became a famous physicist. He came up with some really important ideas about how the universe works, like the Theory of Relativity and the idea that energy and matter are the same thing. He won a Nobel Prize and became very well-known for his genius!`,
    haiku: `Einstein's great mind,
    Theoretical physicist,
    Science legend lives on.`,
    rhyme: `Albert Einstein was oh so clever,
    His genius shone like a bright endeavor,
    Relativity and quantum mechanics he unveiled,
    With equations that have never failed,
    Forever inspiring with his scientific treasure.`,
  });
});

app.listen(port, () => {
  console.log(`Local dev app listening on port ${port}`);
  console.log(`Click "http://localhost:${port}" or "http://localhost:${port}/wiki/Albert_Einstein" to open in your browser`)
});
