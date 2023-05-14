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

export interface Original {
    source: string;
    width: number;
    height: number;
}

export async function fetchWikipediaContent(title: string): Promise<WikiContent> {
    title = title.replaceAll(' ', '_');

    // latest revision, text content, internal links and page image (if available)
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|links|pageimages&titles=${title}&exlimit=1&explaintext=1&exsectionformat=plain&pllimit=max&piprop=original`;

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
    const firstPage = pageValues[0];

    if (!firstPage.extract) {
        logger.info(`Wikipedia page ${title} not found`);
        throw new NoResultsError(`Wikipedia page "${title}" not found. Please try again.`);
    }

    if (firstPage.extract.includes('may refer to:')) {
        logger.info(`Wikipedia page ${title} has multiple results`);
        throw new MultipleResultsError(`Wikipedia page "${title}" has multiple results. Please be more specific.`);
    }

    return {
        article: firstPage.extract,
        links: firstPage.links?.map((link) => link.title) ?? [],
        imageUrl: firstPage.original?.source,
    };
}
