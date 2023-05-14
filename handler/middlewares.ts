import { Request, Response, NextFunction } from 'express';
import { URL } from 'url';
import { logger } from './logger';

/** Replace URL encoded spaces (`%20`) with underscores (`_`) to match Wikipedia URLs */
export const replaceEncodedSpaces = (req: Request, res: Response, next: NextFunction) => {
    const parsedUrl = new URL(req.url, process.env.BASE_URL);

    const originalPathname = parsedUrl.pathname;
    const modifiedPathname = parsedUrl.pathname.replace(/%20/g, '_');

    if (originalPathname !== modifiedPathname && modifiedPathname.startsWith('/wiki/')) {
        const formattedUrl = `${process.env.BASE_URL}${modifiedPathname.substring(6)}`;
        logger.info(`Redirecting to ${formattedUrl} after replacing encoded spaces. Original path: ${req.url}`);
        return res.redirect(formattedUrl);
    }
    logger.info(`No need to replace encoded spaces in URL: ${req.url}`);
    next();
};
