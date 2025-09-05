'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating article titles based on keywords.
 *
 * The flow takes keywords as input and returns a list of creative and relevant article titles.
 *
 * @fileOverview GenerateArticleTitles - A function that handles generating multiple article titles
 * @fileOverview GenerateArticleTitlesInput - The input type for the GenerateArticleTitles function.
 * @fileOverview GenerateArticleTitlesOutput - The return type for the GenerateArticleTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArticleTitlesInputSchema = z.object({
  keywords: z
    .string()
    .describe('The keywords to use when generating article titles.'),
  numTitles: z
    .number()
    .describe('The number of article titles to generate.')
    .default(3),
});
export type GenerateArticleTitlesInput = z.infer<
  typeof GenerateArticleTitlesInputSchema
>;

const GenerateArticleTitlesOutputSchema = z.object({
  titles: z
    .array(z.string())
    .describe('The generated list of article titles.'),
});
export type GenerateArticleTitlesOutput = z.infer<
  typeof GenerateArticleTitlesOutputSchema
>;

export async function generateArticleTitles(
  input: GenerateArticleTitlesInput
): Promise<GenerateArticleTitlesOutput> {
  return generateArticleTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArticleTitlesPrompt',
  input: {schema: GenerateArticleTitlesInputSchema},
  output: {schema: GenerateArticleTitlesOutputSchema},
  prompt: `You are an expert copywriter, skilled at creating engaging and click-worthy article titles.

  Please generate {{numTitles}} article titles based on the following keywords:

  {{keywords}}

  The titles should be creative, relevant, and optimized for search engines. Return the titles as a JSON array. Do not include any explanation or conversational text, only the JSON array of strings.
  `,
});

const generateArticleTitlesFlow = ai.defineFlow(
  {
    name: 'generateArticleTitlesFlow',
    inputSchema: GenerateArticleTitlesInputSchema,
    outputSchema: GenerateArticleTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
