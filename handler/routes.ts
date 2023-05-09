import { Request, Response } from 'express';
import { fetchWikipediaContent } from './wikiFetcher';
import { callGpt } from './summariser';
import { formatSearchTerm } from './utils';
import { SearchContent } from './models';
import { getCachedContent, setCachedContent } from './cache';
import { logger } from './logger';

type TermParam = { term: string };

type Error = {
    message: string;
};

const APP_TITLE = 'Litepedia';

/**
 * Format endpoint success response
 * Used for both cached and uncached responses
 * */
const handleWikiSuccessResponse = (searchContent: SearchContent, res: Response<SearchContent>): void => {
    const term = formatSearchTerm(searchContent.term);
    res.render('result', {
        title: term,
        term,
        // replace newlines with <br> tags
        summary: decodeURIComponent(searchContent.summary).replace(/(?:\r\n|\r|\n)/g, '<br>'),
        haiku: decodeURIComponent(searchContent.haiku).replace(/(?:\r\n|\r|\n)/g, '<br>'),
        rhyme: decodeURIComponent(searchContent.rhyme).replace(/(?:\r\n|\r|\n)/g, '<br>'),
    });
};

export const homeHandler = async (_: Request, res: Response) => {
    res.render('home', {
        title: APP_TITLE,
        baseUrl: process.env.BASE_URL,
    });
};

export const searchHandler = async (req: Request<TermParam>, res: Response<SearchContent | Error>) => {
    const term = req.params.term;

    let wikiContent: string | null = null;

    try {
        wikiContent = await fetchWikipediaContent(term);
    } catch {
        res.status(404).json({ message: `No WikiPedia page found for ${term}` });
        return;
    }

    const cachedContent = await getCachedContent(term);

    if (cachedContent) {
        logger.info(`Returning cached content for term "${term}"`);
        return handleWikiSuccessResponse(cachedContent, res);
    }

    const gptResponse = await callGpt(wikiContent);

    await setCachedContent({ ...gptResponse, term });

    return handleWikiSuccessResponse({ ...gptResponse, term }, res);
};

export const notFoundHandler = async (_: Request, res: Response) => {
    res.status(404).json({ message: 'not found' });
};
