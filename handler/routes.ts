import { Request, Response } from 'express';

export const termWikiHandler = async (_: Request, res: Response) => {
    res.json({ message: 'hello world' });
};

export const notFoundHandler = async (_: Request, res: Response) => {
    res.status(404).json({ message: 'not found' });
};
