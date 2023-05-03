import {
    SSMClient,
    GetParameterCommand,
    GetParameterCommandInput,
    GetParameterCommandOutput,
} from '@aws-sdk/client-ssm';
import { logger } from './logger';

/**
 * Capitalize first letter of a string and replace underscores with spaces
 */
export function formatSearchTerm(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

export const getOpenAiApiKey = async (): Promise<string> => {
    const input: GetParameterCommandInput = {
        Name: process.env.OPENAI_API_KEY_PARAM_NAME,
        WithDecryption: true,
    };
    const command = new GetParameterCommand(input);

    let response: GetParameterCommandOutput | null = null;

    try {
        response = await ssmClient.send(command);
    } catch (error) {
        logger.error(`Failed to retrieve param ${process.env.OPENAI_API_KEY_PARAM_NAME}: ${error}`);
        throw new Error('Failed to retrieve OpenAI API key');
    }

    if (!response.Parameter) {
        logger.error(`No parameter found for ${process.env.OPENAI_API_KEY_PARAM_NAME}`);
        throw new Error('Failed to retrieve OpenAI API key');
    }

    return response.Parameter.Value ?? '';
};
