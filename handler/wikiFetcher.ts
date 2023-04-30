import axios, { AxiosResponse } from 'axios';
import { logger } from './logger';

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

interface Page {
    pageid: number;
    ns: number;
    title: string;
    extract?: string;
}

export async function fetchWikipediaContent(title: string): Promise<string> {
    title = title.replaceAll(' ', '_');

    // latest revision, main text content only,
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${title}&exlimit=1&explaintext=1&exsectionformat=plain`;

    logger.info(`Fetching ${url} from WikiPedia`);

    let response: AxiosResponse<WikiResponse> | null = null;

    try {
        response = await axios.get<WikiResponse>(url);
    } catch (error) {
        logger.error(`Error retrieving WikiPedia page content for url ${url}. Error: ${error}`);
        throw new Error('An error occurred retrieving the WikiPedia page content.');
    }

    const pages = response.data.query.pages;

    const pageValues = Object.values(pages);
    const firstPage = pageValues[0];

    if (!firstPage.extract) {
        logger.info(`WikiPedia page ${title} not found`);
        throw new Error(`WikiPedia page ${title} not found`);
    }

    return firstPage.extract;
}
