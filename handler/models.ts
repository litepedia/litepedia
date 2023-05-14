export type SearchContent = {
    term: string;
    imageUrl?: string;
} & SearchAnswer;

export type SearchAnswer = {
    summary: string;
    haiku: string;
    rhyme: string;
};

export type WikiContent = {
    article: string;
    links: string[];
    // Not all articles have images
    imageUrl?: string;
};
