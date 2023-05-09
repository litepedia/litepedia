export type SearchContent = {
    term: string;
} & SearchAnswer;

export type SearchAnswer = {
    summary: string;
    haiku: string;
    rhyme: string;
};

export type WikiContent = {
    article: string;
    links: string[];
};
