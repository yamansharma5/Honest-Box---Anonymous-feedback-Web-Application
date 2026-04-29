import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {NextResponse} from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { User } from 'next-auth';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST() {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !user){
        return NextResponse.json({
            success: false,
            message: "Not authenticated"
        }, {status: 401})
    }

    try {
        const prompt = `
        Create a list of 3 open-ended and engaging questions that can be used to start a conversation with a new person on a social platform.
        The questions should be suitable for a social or professional networking context.
        The questions should be concise, easy to understand, and encourage thoughtful responses.
        Avoid questions that can be answered with a simple 'yes' or 'no'.
        The response should be a single JSON string, which is an array of 3 strings. For example:
        '["What's a project you're currently excited about?", "What's the most interesting thing you've learned recently?", "If you could have any superpower for a day, what would it be and why?"]'
        Ensure the output is a valid JSON array of strings.
        `;

        const result = await streamText({
            model: openai('gpt-4-turbo'),
            prompt,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return NextResponse.json({
            success: false,
            message: "An unexpected error occurred while suggesting messages."
        }, { status: 500 });
    }
}