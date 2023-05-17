import axios, { AxiosResponse } from 'axios';
import { logger } from './logger';
import { WikiContent } from './models';
import { MultipleResultsError, NoResultsError, WikipediaError } from './errors';

interface WikiResponse {
    batchcomplete: string;
    query: Query;
}

interface Query {
    normalized: Normalized[];
    pages: Record<string, Page>;
}

interface Normalized {
    from: string;
    to: string;
}

interface Link {
    ns: number;
    title: string;
}

interface Page {
    ns: number;
    title: string;
    pageid?: number;
    extract?: string;
    links?: Link[];
    original?: Original;
}

interface Original {
    source: string;
    width: number;
    height: number;
}

/** Handles GET request to Wikipedia API */
const getWikipediaArticle = async (url: string): Promise<Page> => {
    logger.info(`Fetching ${url} from Wikipedia`);

    let response: AxiosResponse<WikiResponse> | null = null;

    try {
        response = await axios.get<WikiResponse>(url);
    } catch (error) {
        logger.error(`Error retrieving Wikipedia page content for url ${url}. Error: ${error}`);
        throw new WikipediaError('An error occurred retrieving the Wikipedia page content. Please try again later.');
    }

    const pages = response.data.query.pages;

    const pageValues = Object.values(pages);

    return pageValues[0];
};

const wordsWithColonRegex = /^\w+:/; // Regex pattern to match Wikipedia links with colons (e.g. "Template talk:British monarchs:")

/** Check if related link is "interesting" for children
 *  This is a fairly arbitrary criteria. Currently it means:
 *  1. Link title does not start with a colon (e.g. "Category:Articles with BNE identifiers")
 *  2. Link title does not start with a dot (e.g. ".eu")
 *  3. Link title does not start with "List of" (e.g. "List of countries by GDP (nominal)")
 */
const isInterestingLink = (linkTitle: string): boolean => {
    return !wordsWithColonRegex.test(linkTitle) && !linkTitle.startsWith('.') && !linkTitle.startsWith('List of');
};

/** Extract link titles and exlude not relevant "colon" links such as "Category:Articles with BNE identifiers"  */
const extractLinks = (links?: Link[]): string[] => {
    if (!links) {
        return [];
    }
    return links.reduce((result: string[], link: Link) => {
        if (isInterestingLink(link.title)) {
            result.push(link.title);
        }
        return result;
    }, []);
};

const NUMBER_OF_RELATED_LINKS = process.env.NUMBER_OF_RELATED_LINKS || 5;

const selectRandomLinks = (possibleLinks: string[]): string[] => {
    const shuffledLinks = possibleLinks.sort(() => 0.5 - Math.random());
    return shuffledLinks.slice(0, Number(NUMBER_OF_RELATED_LINKS));
};

/** Only preserve image format URLs. Do not currently want to handle video formats such as `.webm`, `.mp4` */
const filterImageFormat = (imageUrl?: string): string | undefined => {
    if (!imageUrl) {
        return undefined;
    }

    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].some((format) => imageUrl.endsWith(format))) {
        return imageUrl;
    }
};

export const fetchWikipediaContent = async (title: string): Promise<WikiContent> => {
    // latest revision, text content, internal links and page image (if available)
    const mainArticleUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|links|pageimages&titles=${title}&exlimit=1&explaintext=1&exsectionformat=plain&pllimit=max&piprop=original`;
    const simpleEnglishArticleUrl = `https://simple.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|links|pageimages&titles=${title}&exlimit=1&explaintext=1&exsectionformat=plain&pllimit=max&piprop=original`;

    const [mainArticle, simpleEnglishArticle] = await Promise.all([
        getWikipediaArticle(mainArticleUrl),
        getWikipediaArticle(simpleEnglishArticleUrl),
    ]);

    if (!mainArticle.extract) {
        logger.info(`Wikipedia page ${title} not found`);
        throw new NoResultsError(`Wikipedia page "${title}" not found. Please try again.`);
    }

    if (mainArticle.extract.includes('may refer to:')) {
        logger.info(`Wikipedia page ${title} has multiple results`);
        throw new MultipleResultsError(`Wikipedia page "${title}" has multiple results. Please be more specific.`);
    }

    const randomRelatedLinksSubset = selectRandomLinks(extractLinks(simpleEnglishArticle.links));

    return {
        article: mainArticle.extract,
        links: extractLinks(mainArticle.links),
        imageUrl: filterImageFormat(mainArticle.original?.source),
        relatedLinks: randomRelatedLinksSubset,
    };
};
