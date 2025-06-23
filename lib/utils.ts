import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractStoryMetadata(messageText: string) {
  let storyData = null;
  let storyText = messageText;

  // Step 1: Extract story starting between [STORY_START] and [STORY_END] (if present)
  const storyStartTag = '[STORY_START]';
  const storyEndTag = '[STORY_END]';
  const startIdx = storyText.indexOf(storyStartTag);
  const endIdx = storyText.indexOf(storyEndTag);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    storyText = storyText.substring(startIdx + storyStartTag.length, endIdx).trim();
  }

   // Step 2: Attempt to find JSON
   const jsonMatch = messageText.match(/{[\s\S]*?}/);
   if (jsonMatch) {
     try {
       storyData = JSON.parse(jsonMatch[0]);
     } catch (err) {
       console.warn("Malformed JSON, proceeding without metadata.");
       storyData = {};
     }
   }

  if (storyData) {
    storyData.storyText = storyText;
  }

  return {
    success: !!storyText,
    message: messageText,
    isComplete: messageText.includes("[STORY_START]"),
    storyData,
  };
}