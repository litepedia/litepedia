import { Request, Response } from 'express';
import { fetchWikipediaContent } from './wikiFetcher';
import { callGpt } from './summariser';
import { capitalizeFirstLetter } from './utils';
import { SearchContent } from './models';
import { getCachedContent, setCachedContent } from './cache';
import { logger } from './logger';

type TermParam = { term: string };

type Error = {
    message: string;
};

/**
 * Format endpoint success response
 * Used for both cached and uncached responses
 * */
const handleWikiSuccessResponse = (
    searchContent: SearchContent,
    res: Response<SearchContent>,
): Response<SearchContent> => {
    return res.json({
        term: capitalizeFirstLetter(searchContent.term),
        summary: searchContent?.summary ?? 'No summary found',
        haiku: searchContent?.haiku ?? 'No haiku found',
        rhyme: searchContent?.rhyme ?? 'No rhyme found',
    });
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

    const cachedContent = await getCachedContent(term);

    if (cachedContent) {
        logger.info('Returning cached content for term:', term);
        return handleWikiSuccessResponse(cachedContent, res);
    }

    const gptResponse = await callGpt(wikiContent);

    await setCachedContent({ ...gptResponse, term });

    return handleWikiSuccessResponse({ ...gptResponse, term }, res);
};

export const notFoundHandler = async (_: Request, res: Response) => {
    res.status(404).json({ message: 'not found' });
};
