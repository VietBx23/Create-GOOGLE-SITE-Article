'use server';

import { generateContent } from '@/ai/flows/generate-content';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z.string().min(1),
});

export async function generateContentAction(
  values: z.infer<typeof formSchema>
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const validatedData = formSchema.parse(values);
    const result = await generateContent({ prompt: validatedData.prompt });
    return { success: true, text: result.text };
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data.' };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
