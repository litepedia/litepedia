import { Request, Response } from 'express';
import { fetchWikipediaContent } from './wikiHandler';
import { callGpt } from './summariser';
import { formatSearchTerm } from './utils';
import { SearchContent, WikiContent } from './models';
import { getCachedContent, setCachedContent } from './cache';
import { logger } from './logger';
import { APP_TITLE } from './constants';
import { MultipleResultsError, WikipediaError, NoResultsError } from './errors';

type TermParam = { term: string };

type Error = {
    message: string;
};

/**
 * Format endpoint success response
 * Used for both cached and uncached responses
 * */
const handleWikiSuccessResponse = (searchContent: SearchContent, res: Response<SearchContent>): void => {
    const term = formatSearchTerm(searchContent.term);
    res.render('result', {
        title: term,
        baseUrl: process.env.BASE_URL,
        term,
        summary: searchContent.summary,
        // replace newlines with <br> tags
        haiku: decodeURIComponent(searchContent.haiku).replace(/(?:\r\n|\r|\n)/g, '<br>'),
        rhyme: decodeURIComponent(searchContent.rhyme).replace(/(?:\r\n|\r|\n)/g, '<br>'),
        imageUrl: searchContent.imageUrl,
        relatedLinks: searchContent.relatedLinks,
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

    let wikiContent: WikiContent | null = null;

    try {
        wikiContent = await fetchWikipediaContent(term);
    } catch (err) {
        if (err instanceof WikipediaError) {
            res.status(500).json({ message: err.message });
            return;
        }

        if (err instanceof MultipleResultsError) {
            res.status(400).json({ message: err.message });
            return;
        }

        if (err instanceof NoResultsError) {
            res.status(404).json({ message: err.message });
            return;
        } else {
            logger.error('Unexpected error fetching Wikipedia content');
            res.status(500).json({ message: 'Something went wrong. Please try again later' });
            return;
        }
    }

    const cachedContent = await getCachedContent(term);

    if (cachedContent) {
        logger.info(`Returning cached content for term "${term}"`);
        return handleWikiSuccessResponse(cachedContent, res);
    }

    const gptResponse = await callGpt(wikiContent);

    const searchContent: SearchContent = {
        ...gptResponse,
        term,
        imageUrl: wikiContent.imageUrl,
        relatedLinks: wikiContent.relatedLinks,
    };

    await setCachedContent(searchContent);

    return handleWikiSuccessResponse(searchContent, res);
};

export const notFoundHandler = async (_: Request, res: Response) => {
    res.status(404).json({ message: 'not found' });
};
