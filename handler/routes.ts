import { Request, Response } from 'express';
import { fetchWikipediaContent } from './wikiFetcher';
import { callGpt } from './summariser';
import { capitalizeFirstLetter } from './utils';
import { SearchContent } from './models';

type TermParam = { term: string };

type Error = {
    message: string;
};

export const termWikiHandler = async (req: Request<TermParam>, res: Response<SearchContent | Error>) => {
    const term = req.params.term;

    let wikiContent: string | null = null;

    try {
        wikiContent = await fetchWikipediaContent(term);
    } catch {
        res.status(404).json({ message: `No WikiPedia page found for ${term}` });
        return;
    }

    const gptResponse = await callGpt(wikiContent);

    res.json({
        term: capitalizeFirstLetter(term),
        summary: gptResponse?.summary ?? 'No summary found',
        haiku: gptResponse?.haiku ?? 'No haiku found',
        rhyme: gptResponse?.rhyme ?? 'No rhyme found',
    });
};

export const notFoundHandler = async (_: Request, res: Response) => {
    res.status(404).json({ message: 'not found' });
};
