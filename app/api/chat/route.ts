import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

interface StoryData {
  childName?: string;
  childAge?: number;
  mainCharacter?: string;
  setting?: string;
  storyType?: string;
  moralLesson?: string;
  interests?: string[];
  otherCharacters?: string[];
  storyLength?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, storyData } = await request.json();
    const lastUserMessage = messages[messages.length - 1];

    if (!ASSISTANT_ID) {
      throw new Error('OpenAI Assistant ID not configured');
    }

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: lastUserMessage.content,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
      additional_instructions: `Current story data: ${JSON.stringify(storyData)}. 
      
      Context from previous messages: ${messages.slice(-5).map((m: Message) => `${m.type}: ${m.content}`).join('\n')}`,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while ((runStatus.status as string) === 'running' || (runStatus.status as string) === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const threadMessages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = threadMessages.data
        .filter(message => message.role === 'assistant')
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (assistantMessage && assistantMessage.content[0]?.type === 'text') {
        const responseText = assistantMessage.content[0].text.value;
        
        // Extract story data from response if present
        const updatedStoryData: Partial<StoryData> = {};
        
        // Simple extraction logic - in production, you might want more sophisticated parsing
        if (responseText.toLowerCase().includes('name') && !storyData.childName) {
          const nameMatch = lastUserMessage.content.match(/(?:name is|i'm|called)\s+(\w+)/i);
          if (nameMatch) {
            updatedStoryData.childName = nameMatch[1];
          }
        }
        
        if (responseText.toLowerCase().includes('age') && !storyData.childAge) {
          const ageMatch = lastUserMessage.content.match(/(\d+)\s*(?:years?\s*old|year)/i);
          if (ageMatch) {
            updatedStoryData.childAge = parseInt(ageMatch[1]);
          }
        }

        // Check if this is a complete story
        const isCompleteStory = responseText.length > 500 && 
                               responseText.includes('Once upon a time') || 
                               responseText.includes('The End') ||
                               responseText.match(/\.\s*And\s+they\s+lived/i);

        return NextResponse.json({
          message: responseText,
          storyData: Object.keys(updatedStoryData).length > 0 ? updatedStoryData : null,
          story: isCompleteStory ? responseText : null,
        });
      }
    }

    // Fallback response if something goes wrong
    return NextResponse.json({
      message: "I'm sorry, I'm having trouble processing that right now. Could you please try again?",
      storyData: null,
      story: null,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        storyData: null,
        story: null,
      },
      { status: 500 }
    );
  }
}