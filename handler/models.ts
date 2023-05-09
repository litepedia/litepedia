export type SearchContent = {
    term: string;
} & SearchAnswer;

export type SearchAnswer = {
    summary: string;
    haiku: string;
    rhyme: string;
};
