import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}); 

export async function POST(request: NextRequest) {
    try {
      const { thread_id, message } = await request.json();
      if (!thread_id || !message) {
        return NextResponse.json(
          { success: false, error: 'thread_id and message are required' },
          { status: 400 }
        );
      }
  
      // Step 1: Start the run
      const run = await openai.beta.threads.runs.create(thread_id, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID!,
        additional_messages: [{ role: 'user', content: message }],
      });
  
      // Step 2: Poll for completion
      let runStatus;
      const maxTries = 20;
      let tries = 0;
  
      do {
        await new Promise(res => setTimeout(res, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread_id, run.id);
        tries++;
      } while (
        runStatus.status !== 'completed' &&
        runStatus.status !== 'failed' &&
        runStatus.status !== 'cancelled' &&
        tries < maxTries
      );
  
      if (runStatus.status !== 'completed') {
        return NextResponse.json({
          success: false,
          error: `Run did not complete. Status: ${runStatus.status}`,
        }, { status: 500 });
      }
  
      // Step 3: Fetch messages
      const messagesResponse = await openai.beta.threads.messages.list(thread_id);
      const messages = messagesResponse.data;
      const assistantMessage = messages.find(msg => msg.role === 'assistant');
      const messageText =
        assistantMessage?.content?.[0]?.type === 'text'
          ? assistantMessage.content[0].text.value
          : '';
  
      const parsed = extractStoryMetadata(messageText);
      return NextResponse.json(parsed);
  
    } catch (error) {
      console.error('Error creating and running thread:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
        { status: 500 }
      );
    }
  }

  function extractStoryMetadata(messageText: string) {
    let storyData = null;
    let storyText = messageText;
  
    // Step 1: Remove separator and ```json markdown if present
    storyText = storyText.replace(/\n*[-_]{3,}\n*```?json\s*/i, '').trim();
  
    // Step 2: Attempt to find JSON
    const jsonMatch = messageText.match(/{[\s\S]*?}/);
    if (jsonMatch) {
      const jsonStartIndex = messageText.indexOf(jsonMatch[0]);
      storyText = messageText.substring(0, jsonStartIndex).trim();
  
      try {
        storyData = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.warn("Malformed JSON, proceeding without metadata.");
        storyData = {};
      }
    }
  
    // Step 3: Extract story starting at "Once upon a time" (if present)
    const storyStartIndex = storyText.toLowerCase().indexOf("once upon a time");
    if (storyStartIndex !== -1) {
      storyText = storyText.substring(storyStartIndex).trim();
    }
  
    // Step 4: Remove trailing --- if left behind
    storyText = storyText.replace(/\n*[-_]{3,}\s*$/, '').trim();
  
    if (storyData) {
      storyData.storyText = storyText;
    }
  
    return {
      success: !!storyText,
      message: messageText,
      isComplete: messageText.includes("[STORY_COMPLETE]"),
      storyData,
    };
  }