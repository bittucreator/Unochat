// @azure-openai-endpoint: https://venka-mapr5mvk-eastus2.cognitiveservices.azure.com
import { NextRequest, NextResponse } from 'next/server';

// Streaming support for Azure OpenAI
export async function POST(req: NextRequest) {
  try {
    const { messages, model, stream } = await req.json(); // model is optional, fallback to env
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentId = model || process.env.AZURE_OPENAI_DEPLOYMENT_ID;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!apiKey || !endpoint || !deploymentId || !apiVersion) {
      return NextResponse.json({ error: 'Azure OpenAI environment variables not set.' }, { status: 500 });
    }

    const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
    const body = {
      messages,
      max_tokens: 512,
      temperature: 0.7,
      stream: !!stream,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    if (stream) {
      // Stream the response as Server-Sent Events (SSE)
      if (!response.body) {
        return NextResponse.json({ error: 'No response body from Azure OpenAI.' }, { status: 500 });
      }
      const encoder = new TextEncoder();
      const streamBody = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          let done = false;
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            if (value) controller.enqueue(encoder.encode(`data: ${new TextDecoder().decode(value)}\n\n`));
            done = doneReading;
          }
          controller.close();
        },
      });
      return new Response(streamBody, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
