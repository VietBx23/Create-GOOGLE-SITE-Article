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
  plainTitle: string;
  titleWithLink: string;
  content: string;
};


// Generate a pseudo-random alphanumeric string from a seed
const generatePseudoRandomSuffix = (seed: string, length: number): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        hash = (hash * 16807 + i) % 2147483647;
        result += chars.charAt(Math.abs(hash) % chars.length);
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

    for (let i = 0; i < secondaryKeywords.length; i++) {
      const secondaryKeyword = secondaryKeywords[i];
      const appFixed = FIXED_APPS[i % FIXED_APPS.length];
      const urlFixed = FIXED_URLS[i % FIXED_URLS.length];
      const primaryKeyword = primaryKeywords[i % primaryKeywords.length];


      const availableSecondary = secondaryKeywords.filter(
        k => k !== secondaryKeyword && k !== primaryKeyword
      );

      const selectedSecondary: string[] = [];
      let selectionPool = [...availableSecondary];
      // Use a deterministic way to select items to avoid hydration issues
      while (selectedSecondary.length < 2 && selectionPool.length > 0) {
          const candidateIndex = (today.getSeconds() + i + selectedSecondary.length) % selectionPool.length;
          const candidate = selectionPool[candidateIndex];
          selectedSecondary.push(candidate);
          selectionPool.splice(candidateIndex, 1);
      }
      while (selectedSecondary.length < 2) {
        selectedSecondary.push('');
      }

      const uniqueKeywordList = [...new Set([primaryKeyword, secondaryKeyword, ...selectedSecondary])];
      while (uniqueKeywordList.length < 4) {
        uniqueKeywordList.push('');
      }
      
      const fileSuffix = `${todayStr}-${validatedData.cy}|881比鸭`;
      const seed = `${primaryKeyword}${secondaryKeyword}${i}`;
      const randomSuffix = generatePseudoRandomSuffix(seed, 6);
      const domain = `https://${validatedData.chosenLink}/`;
      const linkHtml = `<a href="${domain}" target="_blank">${validatedData.chosenLink}</a>`;
      
      const titleWithLink = `${uniqueKeywordList[0]} - ${uniqueKeywordList[1]} -【链接地址：<a href="${domain}" target="_blank">${validatedData.chosenLink}</a>】- ${uniqueKeywordList[2]} - ${uniqueKeywordList[3]} - ${fileSuffix} ${randomSuffix}`;
      const plainTitle = `${uniqueKeywordList[0]} - ${uniqueKeywordList[1]} -【链接地址：${validatedData.chosenLink}】- ${uniqueKeywordList[2]} - ${uniqueKeywordList[3]} - ${fileSuffix} ${randomSuffix}`;
      const titleForContent = `${uniqueKeywordList[0]} - ${uniqueKeywordList[1]} -【链接地址：${linkHtml}】- ${uniqueKeywordList[2]} - ${uniqueKeywordList[3]} - ${fileSuffix} ${randomSuffix}`;
      
      let template = TEMPLATES[i % TEMPLATES.length];
      const keywordsText = uniqueKeywordList.filter(Boolean).join(', ');
      const date = format(today, 'yyyy-MM-dd');

      const mainLink = `<p style="font-size: 8rem; text-align: left;"><a href="${domain}" target="_blank">👉👉立即进入👈👈</a></p>`;
      
      let content = template
        .replace(/{title}/g, titleForContent)
        .replace(/{app}/g, appFixed)
        .replace(/{url}/g, urlFixed)
        .replace(/{keywords_text}/g, keywordsText)
        .replace(/{date}/g, date)
        .replace(/{domain}/g, domain)
        .replace(/{mainLink}/g, mainLink);
      
      const htmlContent = content.replace(/\n/g, '<br />');
      
      results.push({ plainTitle, titleWithLink, content: htmlContent });
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
