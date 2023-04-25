import {
    APIGatewayProxyEventV2WithRequestContext,
    APIGatewayProxyResult,
    APIGatewayEventRequestContextV2,
} from 'aws-lambda';
import express from 'express';

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const app = express();
console.log('app from express:', app);

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const lambdaHandler = async (
    event: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>,
): Promise<APIGatewayProxyResult> => {
    console.log('event :', event.rawPath);

    const writeCommand = new PutItemCommand({
        TableName: process.env.SEARCH_CACHE_TABLE,
        Item: { search: { S: event.rawPath }, result: { S: event.rawPath } },
    });

    try {
        const data = await ddbClient.send(writeCommand);
        console.log('data :', data);
    } catch (err) {
        console.log('err writing to Dynamo:', err);
    }

    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
