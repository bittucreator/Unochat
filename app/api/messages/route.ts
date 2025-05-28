// @azure-openai-endpoint: https://venka-mapr5mvk-eastus2.cognitiveservices.azure.com
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

// GET: Fetch chat messages or sessions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('sessions')) {
      // Return chat sessions for the user
      const user_id = searchParams.get('user_id');
      if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      const sessions = await sql`SELECT * FROM chat_sessions WHERE user_id = ${user_id} ORDER BY created_at DESC;`;
      return NextResponse.json({ sessions });
    }
    const session_id = searchParams.get('session_id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    let result;
    if (session_id) {
      result = await sql`SELECT * FROM messages WHERE session_id = ${session_id} ORDER BY created_at ASC LIMIT ${limit};`;
    } else {
      result = await sql`SELECT * FROM messages ORDER BY created_at ASC LIMIT ${limit};`;
    }
    return NextResponse.json({ messages: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST: Add a new chat message or create a session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.createSession) {
      // Create a new chat session
      const { user_id, title } = body;
      if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      const result = await sql`
        INSERT INTO chat_sessions (user_id, title)
        VALUES (${user_id}, ${title || null})
        RETURNING *;
      `;
      return NextResponse.json({ session: result[0] });
    }
    const { user, content, session_id } = body;
    if (!user || !content) {
      return NextResponse.json({ error: 'Missing user or content' }, { status: 400 });
    }
    const result = await sql`
      INSERT INTO messages (user, content, session_id)
      VALUES (${user}, ${content}, ${session_id || null})
      RETURNING *;
    `;
    return NextResponse.json({ message: result[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// PATCH: Rename a chat session
export async function PATCH(req: NextRequest) {
  try {
    const { session_id, title } = await req.json();
    if (!session_id || !title) {
      return NextResponse.json({ error: 'Missing session_id or title' }, { status: 400 });
    }
    const result = await sql`
      UPDATE chat_sessions SET title = ${title} WHERE id = ${session_id} RETURNING *;
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ session: result[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Delete a chat session and its messages
export async function DELETE(req: NextRequest) {
  try {
    const { session_id } = req ? await req.json() : {};
    if (session_id) {
      await sql`DELETE FROM messages WHERE session_id = ${session_id};`;
      await sql`DELETE FROM chat_sessions WHERE id = ${session_id};`;
      return NextResponse.json({ success: true });
    } else {
      // If no session_id, delete all messages (legacy clear chat)
      await sql`DELETE FROM messages;`;
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
