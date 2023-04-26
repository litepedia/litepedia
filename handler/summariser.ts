import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi } from 'openai';
import { getOpenAiApiKey } from './utils';

const BASE_QUESTION =
    process.env.GPT_QUESTION || 'explain to a first grader this paragraph in no longer than four sentences \n';

const setupOpenApiClient = (): OpenAIApi => {
    const configuration = new Configuration({ apiKey: getOpenAiApiKey() });

    return new OpenAIApi(configuration);
};

const openai = setupOpenApiClient();

export async function callGpt(text: string): Promise<ChatCompletionResponseMessage | undefined> {
    const message: ChatCompletionRequestMessage = { role: 'user', content: `${BASE_QUESTION} ${text}` };

    const response = await openai.createChatCompletion({
        messages: [message],
        model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
    });

    const botMessage = response.data.choices[0].message;

    return botMessage;
}
