'use server';

import { z } from 'zod';
import { FIXED_APPS, FIXED_URLS, TEMPLATES } from '@/lib/g-site-automator-data';
import { format } from 'date-fns';
import { suggestKeywords } from '@/ai/flows/keyword-suggestions';

const formSchema = z.object({
  primaryKeywords: z.string().min(1),
  secondaryKeywords: z.string().min(1),
  cy: z.string().min(1),
  chosenLink: z.string().min(1),
});

type Article = {
  title: string;
  content: string;
};

// Helper to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate a random string
const generateRandomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function generateArticles(
  values: z.infer<typeof formSchema>
): Promise<{ success: boolean; results?: Article[]; error?: string }> {
  try {
    const validatedData = formSchema.parse(values);

    const primaryKeywords = validatedData.primaryKeywords.split(/[,\n]/).map(k => k.trim()).filter(Boolean);
    const secondaryKeywords = validatedData.secondaryKeywords.split(/[,\n]/).map(k => k.trim()).filter(Boolean);

    if (primaryKeywords.length === 0 || secondaryKeywords.length === 0) {
        return { success: false, error: "Primary and secondary keywords cannot be empty." };
    }
    
    const results: Article[] = [];
    const today = new Date();
    const todayStr = format(today, 'MMdd');

    for (const secondaryKeyword of secondaryKeywords) {
      const appFixed = getRandomItem(FIXED_APPS);
      const urlFixed = getRandomItem(FIXED_URLS);
      const primaryKeyword = getRandomItem(primaryKeywords);

      const availableSecondary = secondaryKeywords.filter(
        k => k !== secondaryKeyword && k !== primaryKeyword
      );

      const selectedSecondary: string[] = [];
      while (selectedSecondary.length < 2 && availableSecondary.length > 0) {
        const candidate = getRandomItem(availableSecondary);
        if (!selectedSecondary.includes(candidate)) {
          selectedSecondary.push(candidate);
          const indexToRemove = availableSecondary.indexOf(candidate);
          availableSecondary.splice(indexToRemove, 1);
        }
      }
      while (selectedSecondary.length < 2) {
        selectedSecondary.push('');
      }

      const keywordList = [primaryKeyword, secondaryKeyword, ...selectedSecondary];
      const uniqueKeywordList = [...new Set(keywordList)];
      while (uniqueKeywordList.length < 4) {
        uniqueKeywordList.push('');
      }

      const fileSuffix = `${todayStr}-cy|881比鸭`;
      const randomStr = generateRandomString(6);

      const title = `${uniqueKeywordList[0]} - ${uniqueKeywordList[1]} -【链接地址：${validatedData.chosenLink}】- ${uniqueKeywordList[2]} - ${uniqueKeywordList[3]} - ${fileSuffix} ${randomStr}`;
      
      let template = getRandomItem(TEMPLATES);
      const keywordsText = uniqueKeywordList.filter(Boolean).join(', ');
      const date = format(today, 'yyyy-MM-dd');
      
      const domain = `https://${validatedData.chosenLink}/`;

      let content = template
        .replace(/{title}/g, title)
        .replace(/{app}/g, appFixed)
        .replace(/{url}/g, urlFixed)
        .replace(/{keywords_text}/g, keywordsText)
        .replace(/{date}/g, date)
        .replace(/{domain}/g, domain);
      
      const htmlContent = content.replace(/\n/g, '<br />');
      
      results.push({ title, content: htmlContent });
    }

    return { success: true, results };
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Invalid input data." };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}


export async function suggestArticleKeywords(
  topic: string
): Promise<{ success: boolean; suggestions?: string[]; error?: string }> {
  if (!topic) {
    return { success: false, error: 'Topic is required.' };
  }
  try {
    const result = await suggestKeywords({ initialInput: topic });
    return { success: true, suggestions: result.suggestions };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to communicate with AI model.' };
  }
}
