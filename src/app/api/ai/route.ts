import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

// Healthcheck endpoint for fast debugging
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const body = await req.json();
  const { prompt, messages, model, selectedIntegration } = body;

  // Fetch user integration tokens from DB if needed
  let userIntegrations: { notion_token?: string; notion_database_id?: string; linear_token?: string } = {};
  if (session.user?.email) {
    // Neon DB query (Postgres)
    const dbRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/integrations/status`, {
      method: 'GET',
      headers: { 'x-user-email': session.user.email }
    });
    if (dbRes.ok) {
      const integrations = await dbRes.json();
      integrations.forEach((intg: any) => {
        if (intg.key === 'notion' && intg.connected) {
          userIntegrations.notion_token = intg.token;
          userIntegrations.notion_database_id = intg.database_id;
        }
        if (intg.key === 'linear' && intg.connected) {
          userIntegrations.linear_token = intg.token;
        }
      });
    }
  }

  // Compose system prompt based on selected integration
  let systemPrompt = "You are a helpful AI agent. Answer or perform any task as requested.";
  if (selectedIntegration === 'notion' && userIntegrations.notion_token && userIntegrations.notion_database_id) {
    systemPrompt = `You are an AI assistant with access to the user's Notion workspace. You can create pages in the user's selected Notion database (id: ${userIntegrations.notion_database_id}). If the user asks to save, summarize, or organize information, create a Notion page with the relevant content. Reply with a summary and confirmation.`;
  } else if (selectedIntegration === 'linear' && userIntegrations.linear_token) {
    systemPrompt = `You are an AI assistant with access to the user's Linear workspace. You can create issues in Linear for the user. If the user asks to create a task, bug, or feature request, create a Linear issue and reply with a summary and confirmation.`;
  }

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
    const filtered = messages.filter(m => m && typeof m.content === 'string' && m.content.trim() !== '');
    openAIMessages = [
      { role: "system", content: systemPrompt },
      ...filtered.map(m => ({ role: m.role, content: m.content }))
    ];
  } else if (typeof prompt === 'string' && prompt.trim() !== '') {
    openAIMessages = [
      { role: "system", content: systemPrompt },
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

    let notionPageCreated = false;
    let notionPageUrl = null;
    // If Notion integration is selected and AI response is present, create a Notion page
    if (
      selectedIntegration === 'notion' &&
      userIntegrations.notion_token &&
      userIntegrations.notion_database_id &&
      data?.choices?.[0]?.message?.content
    ) {
      try {
        const notionRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userIntegrations.notion_token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            parent: { database_id: userIntegrations.notion_database_id },
            properties: {
              Name: {
                title: [
                  {
                    text: { content: (prompt || 'AI Task') }
                  }
                ]
              }
            },
            children: [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [
                    {
                      type: 'text',
                      text: { content: data.choices[0].message.content }
                    }
                  ]
                }
              }
            ]
          })
        });
        if (notionRes.ok) {
          const notionData = await notionRes.json();
          notionPageCreated = true;
          notionPageUrl = notionData.url || null;
        }
      } catch (notionErr) {
        console.error('Failed to create Notion page:', notionErr);
      }
    }

    // --- Linear Automation ---
    let linearIssueCreated = false;
    let linearIssueUrl = null;
    if (
      selectedIntegration === 'linear' &&
      userIntegrations.linear_token &&
      data?.choices?.[0]?.message?.content
    ) {
      try {
        // You must set your Linear API key as the user's linear_token
        const linearRes = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: {
            'Authorization': userIntegrations.linear_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { issue { id identifier url title } } }`,
            variables: {
              input: {
                title: prompt || 'AI Task',
                description: data.choices[0].message.content,
                // Optionally, set teamId or other fields here
              }
            }
          })
        });
        if (linearRes.ok) {
          const linearData = await linearRes.json();
          const issue = linearData?.data?.issueCreate?.issue;
          if (issue && issue.url) {
            linearIssueCreated = true;
            linearIssueUrl = issue.url;
          }
        }
      } catch (linearErr) {
        console.error('Failed to create Linear issue:', linearErr);
      }
    }

    return NextResponse.json({
      result: data?.choices?.[0]?.message?.content || "",
      notionPageCreated,
      notionPageUrl,
      linearIssueCreated,
      linearIssueUrl
    });
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[AI API] Exception after ${elapsed}ms:`, err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
