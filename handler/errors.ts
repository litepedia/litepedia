/** Generic Wikipeia error */
export class WikipediaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WikipediaError';
    }
}

/** Multiple Wikipedia results found for search term */
export class MultipleResultsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MultipleResultsError';
    }
}

/** No Wikipedia results found for search term */
export class NoResultsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoResultsError';
    }
}
