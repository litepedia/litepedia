import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { logger } from './logger';
import { SearchContent } from './models';

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const getCachedContent = async (term: string): Promise<SearchContent | null> => {
    const readCommand = new GetItemCommand({
        TableName: process.env.SEARCH_CACHE_TABLE,
        Key: { term: { S: term } },
    });

    try {
        const data = await ddbClient.send(readCommand);

        if (!data.Item) {
            return null;
        }

        return unmarshall(data.Item) as SearchContent;
    } catch (err) {
        logger.error('Error retriving cached search term:', err);
        return null;
    }
};

export const setCachedContent = async (values: SearchContent): Promise<void> => {
    const writeCommand = new PutItemCommand({
        TableName: process.env.SEARCH_CACHE_TABLE,
        Item: {
            term: { S: values.term },
            summary: values.summary ? { S: values.summary } : { NULL: true },
            haiku: values.haiku ? { S: values.haiku } : { NULL: true },
            rhyme: values.rhyme ? { S: values.rhyme } : { NULL: true },
        },
    });

    try {
        const data = await ddbClient.send(writeCommand);
        logger.info('Wrote cached search term row:', data);
    } catch (err) {
        logger.error('Error writing cached search term:', err);
    }
};
