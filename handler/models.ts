export type SearchContent = {
    term: string;
} & SearchAnswer;

export type SearchAnswer = {
    summary: string;
    haiku: string;
    rhyme: string;
    /** Not all articles have images **/
    imageUrl?: string;
    /** These are extracted from the Simple English version of the article (when available) to be displayed alongside our article  */
    relatedLinks?: string[];
};

export type WikiContent = {
    article: string;
    links: string[];
} & Pick<SearchAnswer, 'imageUrl' | 'relatedLinks'>;
