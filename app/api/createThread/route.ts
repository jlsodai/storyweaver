import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const run = await openai.beta.threads.createAndRun({
            assistant_id: process.env.OPENAI_ASSISTANT_ID!
        });

        // console.log('Run started:', run);
        return NextResponse.json({ success: true, run });
    } catch (error) {
        console.error('Error creating and running thread:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}
  