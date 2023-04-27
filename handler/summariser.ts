import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi } from 'openai';
import { getOpenAiApiKey } from './utils';
import { logger } from './logger';

const BASE_QUESTION =
    process.env.GPT_QUESTION || 'Explain to a first grader this paragraph in no longer than four sentences \n';

// createChatCompletion API request errors if content is too long
const TEXT_MAX_LENGTH = process.env.TEXT_MAX_LENGTH || 15000;

const setupOpenApiClient = (apiKey: string): OpenAIApi => {
    const configuration = new Configuration({ apiKey });

    return new OpenAIApi(configuration);
};

export const callGpt = async (text: string): Promise<ChatCompletionResponseMessage | undefined> => {
    const apiKey = await getOpenAiApiKey();
    // TODO: move this into parent scope
    const openai = setupOpenApiClient(apiKey);

    const message: ChatCompletionRequestMessage = {
        role: 'user',
        content: `${BASE_QUESTION}: ${text.substring(0, Number(TEXT_MAX_LENGTH))}`,
    };

    try {
        const response = await openai.createChatCompletion({
            messages: [message],
            model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
        });

        const botMessage = response.data.choices[0].message;

        logger.info(`Got ChatGPT response: ${botMessage}`);
        return botMessage;
    } catch (error) {
        logger.error(`Failed to call GPT: ${error}`);
        throw new Error('Failed to get text summary');
    }
};
