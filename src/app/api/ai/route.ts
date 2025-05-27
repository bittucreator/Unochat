import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// Healthcheck endpoint for fast debugging
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const body = await req.json();
  const { prompt, messages, model } = body;

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = model || process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!endpoint || !apiKey || !deployment) {
    console.error("[AI API] Missing Azure OpenAI environment variables");
    return NextResponse.json({ error: "Azure OpenAI environment variables not set." }, { status: 500 });
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

  let openAIMessages;
  if (Array.isArray(messages)) {
    // Remove message limit: use all filtered messages
    const filtered = messages.filter(m => m && typeof m.content === 'string' && m.content.trim() !== '');
    openAIMessages = [
      { role: "system", content: "You are a helpful AI agent. Answer or perform any task as requested." },
      ...filtered.map(m => ({ role: m.role, content: m.content }))
    ];
  } else if (typeof prompt === 'string' && prompt.trim() !== '') {
    openAIMessages = [
      { role: "system", content: "You are a helpful AI agent. Answer or perform any task as requested." },
      { role: "user", content: prompt }
    ];
  } else {
    console.warn("[AI API] No valid prompt or messages provided");
    return NextResponse.json({ error: "No valid prompt or messages provided." }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: openAIMessages,
        max_tokens: 256, // more reliable
        temperature: 0.7,
        stream: false,
      }),
    });

    const elapsed = Date.now() - start;
    console.log(`[AI API] Azure OpenAI response time: ${elapsed}ms`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[AI API] Azure OpenAI error:`, error);
      return NextResponse.json({ error }, { status: response.status });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error('[AI API] Failed to parse Azure response as JSON:', jsonErr);
      return NextResponse.json({ error: 'AI service returned invalid response.' }, { status: 502 });
    }
    console.log('[AI API] Azure OpenAI data:', JSON.stringify(data));
    return NextResponse.json({ result: data?.choices?.[0]?.message?.content || "" });
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[AI API] Exception after ${elapsed}ms:`, err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
