import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { logger } from './logger';

export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

export const getOpenAiApiKey = async (): Promise<string> => {
    console.log('process.env.OPENAI_API_KEY_PARAM_NAME: ', process.env.OPENAI_API_KEY_PARAM_NAME);
    const input = {
        Names: [process.env.OPENAI_API_KEY_PARAM_NAME ?? ''],
        WithDecryption: true,
    };
    const command = new GetParametersCommand(input);
    const response = await ssmClient.send(command);

    if (!response.Parameters || response.Parameters.length === 0) {
        logger.error(`Failed to retrieve param ${process.env.OPENAI_API_KEY_PARAM_NAME}`);
        throw new Error('Failed to retrieve OpenAI API key');
    }

    return response.Parameters[0].Value ?? '';
};
