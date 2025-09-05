// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An SEO Analyzer AI agent.
 *
 * - improveArticleSEO - A function that handles the SEO analysis process.
 * - ImproveArticleSEOInput - The input type for the improveArticleSEO function.
 * - ImproveArticleSEOOutput - The return type for the improveArticleSEO function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveArticleSEOInputSchema = z.object({
  articleContent: z
    .string()
    .describe("The content of the article that needs SEO improvement."),
  keywords: z.string().describe('The keywords for which the article should rank.'),
});
export type ImproveArticleSEOInput = z.infer<typeof ImproveArticleSEOInputSchema>;

const ImproveArticleSEOOutputSchema = z.object({
  feedback: z.string().describe('SEO feedback for the article.'),
  improvedArticle: z.string().describe('The improved article content.'),
});
export type ImproveArticleSEOOutput = z.infer<typeof ImproveArticleSEOOutputSchema>;

export async function improveArticleSEO(input: ImproveArticleSEOInput): Promise<ImproveArticleSEOOutput> {
  return improveArticleSEOFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveArticleSEOPrompt',
  input: {schema: ImproveArticleSEOInputSchema},
  output: {schema: ImproveArticleSEOOutputSchema},
  prompt: `You are an SEO expert. Analyze the following article and provide feedback on how to improve its SEO for the given keywords. Then, provide the improved article content.

Article Content: {{{articleContent}}}
Keywords: {{{keywords}}}

SEO Feedback and Improved Article:
`,
});

const improveArticleSEOFlow = ai.defineFlow(
  {
    name: 'improveArticleSEOFlow',
    inputSchema: ImproveArticleSEOInputSchema,
    outputSchema: ImproveArticleSEOOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
