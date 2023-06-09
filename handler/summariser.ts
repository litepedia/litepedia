import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { getOpenAiApiKey } from './utils';
import { logger } from './logger';
import { SearchAnswer, WikiContent } from './models';

import { load } from 'cheerio';

const BASE_SUMMARY_PROMPT =
    process.env.GPT_SUMMARY_PROMPT || 'Explain to a first grader this text in no longer than four sentences: \n';

const BASE_HAIKU_PROMPT = process.env.GPT_HAIKU_PROMPT || 'Give me a Haiku for the following text: \n';

const BASE_RHYME_PROMPT =
    process.env.GPT_RHYME_PROMPT ||
    'Give me a rhyme for children in no longer than five lines for the following text: \n';

// createChatCompletion API request errors if content is too long
const TEXT_MAX_LENGTH = process.env.TEXT_MAX_LENGTH || 15000;

const setupOpenApiClient = (apiKey: string): OpenAIApi => {
    const configuration = new Configuration({ apiKey });

    return new OpenAIApi(configuration);
};

/** Remove special characters that have meaning in regexes */
const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Add related links from the Wikipedia article to the summary
 */
const addRelatedLinks = (summary: string, links: string[]): string => {
    const $ = load(summary);
    const html = $('body').html();

    if (!html) {
        return summary;
    }

    return links.reduce((html, link) => {
        const escapedLink = escapeRegExp(link);
        return html.replace(
            new RegExp(`\\b${escapedLink}\\b`, 'g'),
            `<a href="${process.env.BASE_URL}${link}">${link}</a>`,
        );
    }, html);
};

export const callGpt = async (wikiContent: WikiContent): Promise<SearchAnswer> => {
    const apiKey = await getOpenAiApiKey();
    // TODO: move this into parent scope
    const openai = setupOpenApiClient(apiKey);

    const trunactedText = wikiContent.article.substring(0, Number(TEXT_MAX_LENGTH));

    const summaryMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: `${BASE_SUMMARY_PROMPT}: ${trunactedText}}`,
    };

    const haikuMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: `${BASE_HAIKU_PROMPT}: ${trunactedText}}`,
    };

    const rhymeMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content: `${BASE_RHYME_PROMPT}: ${trunactedText}}`,
    };

    try {
        console.time('gpt API call');
        const responses = await Promise.all([
            openai.createChatCompletion({
                messages: [summaryMessage],
                model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
            }),
            openai.createChatCompletion({
                messages: [haikuMessage],
                model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
            }),
            openai.createChatCompletion({
                messages: [rhymeMessage],
                model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
            }),
        ]);
        console.timeEnd('gpt API call');

        const summary = responses[0].data.choices[0].message?.content;
        const haiku = responses[1].data.choices[0].message?.content;
        const rhyme = responses[2].data.choices[0].message?.content;

        logger.info(`GPT summary: ${summary}. GPT haiku: ${haiku}. GPT rhyme: ${rhyme}`);

        const summaryWithRelatedLinks = summary ? addRelatedLinks(summary, wikiContent.links) : 'No summary found';

        logger.info(`Added related Wikipedia links to summary: "${summaryWithRelatedLinks}"`);

        return {
            summary: summaryWithRelatedLinks,
            // encode string to preserve new line characters
            haiku: haiku ? encodeURIComponent(haiku) : 'No haiku found',
            rhyme: rhyme ? encodeURIComponent(rhyme) : 'No rhyme found',
        };
    } catch (error) {
        logger.error(`Failed to call GPT: ${error}`);
        throw new Error('Failed to get text summary');
    }
};
