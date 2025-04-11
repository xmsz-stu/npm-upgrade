import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a translator. Translate the following text to Chinese. Keep the technical terms in English if they are commonly used in Chinese development context."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });

    const translatedText = response.choices[0]?.message?.content || text;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
} 