// keyword-suggestions.ts
'use server';
/**
 * @fileOverview Provides keyword suggestions based on initial input for SEO improvement.
 *
 * - suggestKeywords - A function that generates keyword suggestions.
 * - KeywordSuggestionsInput - The input type for the suggestKeywords function.
 * - KeywordSuggestionsOutput - The return type for the suggestKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeywordSuggestionsInputSchema = z.object({
  initialInput: z
    .string()
    .describe('The initial input from the user to generate keyword suggestions from.'),
});
export type KeywordSuggestionsInput = z.infer<typeof KeywordSuggestionsInputSchema>;

const KeywordSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of keyword suggestions based on the initial input.'),
});
export type KeywordSuggestionsOutput = z.infer<typeof KeywordSuggestionsOutputSchema>;

export async function suggestKeywords(input: KeywordSuggestionsInput): Promise<KeywordSuggestionsOutput> {
  return suggestKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'keywordSuggestionsPrompt',
  input: {schema: KeywordSuggestionsInputSchema},
  output: {schema: KeywordSuggestionsOutputSchema},
  prompt: `You are an SEO expert. Generate a list of keyword suggestions related to the following input: {{{initialInput}}}. Return a JSON array of strings.`, // Ensure output is a JSON array of strings
});

const suggestKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestKeywordsFlow',
    inputSchema: KeywordSuggestionsInputSchema,
    outputSchema: KeywordSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
