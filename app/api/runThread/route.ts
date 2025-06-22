import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}); 

export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { thread_id, message, get_history } = body;
      if (!thread_id) {
        return NextResponse.json(
          { success: false, error: 'thread_id is required' },
          { status: 400 }
        );
      }
  
      // If get_history is true, return all previous messages for this thread
      if (get_history) {
        const messagesResponse = await openai.beta.threads.messages.list(thread_id);
        // Reverse the messages so oldest is first, newest is last
        const messages = messagesResponse.data.slice().reverse().map((msg: any, idx: number) => {
          let content = '';
          if (msg.content && Array.isArray(msg.content) && msg.content[0]?.type === 'text') {
            content = msg.content[0].text.value;
          }
          // Try to extract story and storyData if present
          const parsed = extractStoryMetadata(content);
          return {
            id: msg.id || String(idx + 1),
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: parsed.storyData?.storyText || content,
            timestamp: msg.created_at ? new Date(msg.created_at * 1000) : new Date(),
            story: parsed.storyData?.storyText,
            storyData: parsed.storyData || undefined
          };
        });
        return NextResponse.json({ success: true, history: messages });
      }
  
      const { thread_id: newThreadId, message: newMessage } = body;
      if (!newThreadId || !newMessage) {
        return NextResponse.json(
          { success: false, error: 'thread_id and message are required' },
          { status: 400 }
        );
      }
  
      // Step 1: Start the run
      const run = await openai.beta.threads.runs.create(newThreadId, {
        assistant_id: process.env.OPENAI_ASSISTANT_ID!,
        additional_messages: [{ role: 'user', content: newMessage }],
      });
  
      // Step 2: Poll for completion
      let runStatus;
      const maxTries = 50;
      let tries = 0;
  
      do {
        await new Promise(res => setTimeout(res, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(newThreadId, run.id);
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
      const messagesResponse = await openai.beta.threads.messages.list(newThreadId);
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
    // const storyStartIndex = storyText.toLowerCase().indexOf("once upon a time");
    // if (storyStartIndex !== -1) {
    //   storyText = storyText.substring(storyStartIndex).trim();
    // }

    const storyStartTag = '[STORY_START]';
    const storyEndTag = '[STORY_END]';
    const startIdx = storyText.indexOf(storyStartTag);
    const endIdx = storyText.indexOf(storyEndTag);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      storyText = storyText.substring(startIdx + storyStartTag.length, endIdx).trim();
    } else {
      // Fallback to "Once upon a time" logic
      const storyStartIndex = storyText.toLowerCase().indexOf("once upon a time");
      if (storyStartIndex !== -1) {
        storyText = storyText.substring(storyStartIndex).trim();
      }
    }
  
    // Step 4: Remove trailing --- if left behind
    storyText = storyText.replace(/\n*[-_]{3,}\s*$/, '').trim();
  
    if (storyData) {
      storyData.storyText = storyText;
    }

    // console.log("Extracted story data:", { storyText, storyData });
  
    return {
      success: !!storyText,
      message: messageText,
      isComplete: messageText.includes("[STORY_START]"),
      storyData,
    };
  }