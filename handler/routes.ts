import { Request, Response } from 'express';
import { fetchWikipediaContent } from './wikiFetcher';
import { callGpt } from './summariser';
import { capitalizeFirstLetter } from './utils';

type TermParam = { term: string };

export const termWikiHandler = async (req: Request<TermParam>, res: Response) => {
    const term = req.params.term;

    const wikiContent = await fetchWikipediaContent(term);
    const gptResponse = await callGpt(wikiContent);
    res.json({
        title: capitalizeFirstLetter(term),
        content: capitalizeFirstLetter(gptResponse?.content ?? 'No content found'),
    });
};

export const notFoundHandler = async (_: Request, res: Response) => {
    res.status(404).json({ message: 'not found' });
};
