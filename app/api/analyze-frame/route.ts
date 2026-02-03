import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_PROMPT = `You analyze pool/swimming footage. Detect signs of drowning or distress:
- Vertical posture (person upright, unable to swim)
- Inability to keep head above water
- Lack of coordinated arm movement, struggling
- Person not moving or sinking
- Person fully submerged (underwater, not visible at surface)

Respond ONLY with valid JSON in this exact format, no other text:
{"distress": true or false, "confidence": 0-1, "description": "brief explanation", "submerged": true or false}

Use "submerged": true only when a person is fully underwater (not at surface). Focus on pose and motion only. No facial identification. Be cautious—false negatives are serious.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        distress: false,
        confidence: 0,
        description: "OpenAI API key not configured. Running in mock mode.",
        submerged: false,
        mock: true,
      },
      { status: 200 }
    );
  }

  let body: { imageBase64?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const imageBase64 = body?.imageBase64;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json(
      { error: "Missing imageBase64" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(imageBase64, "base64");
  if (buffer.length > 4 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image too large (max 4MB)" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: OPENAI_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr) as {
      distress: boolean;
      confidence: number;
      description: string;
      submerged?: boolean;
    };
    const result = {
      distress: parsed.distress,
      confidence: parsed.confidence,
      description: parsed.description,
      submerged: parsed.submerged ?? false,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}
