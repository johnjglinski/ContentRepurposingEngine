import { NextRequest, NextResponse } from 'next/server';

// Allowed origins for CORS
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

// Valid price IDs for reference
const VALID_PRICE_IDS = [
  process.env.STRIPE_BASIC_PRICE_ID,
  process.env.STRIPE_PRO_PRICE_ID,
  process.env.STRIPE_AGENCY_PRICE_ID,
].filter(Boolean);

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
  }
  return {};
}

// Content generation via LM Studio (local) or OpenAI (cloud)
async function generatePostsLocally(content: string): Promise<string[]> {
  const lmStudioUrl = process.env.LM_STUDIO_URL;
  const openaiKey = process.env.OPENAI_API_KEY;

  const prompt = `You are a social media content expert. Given the following blog post content, generate 4 engaging social media posts optimized for Twitter/LinkedIn. Each post should be concise (under 280 characters), include relevant hashtags, and capture a key insight from the blog post. Return ONLY a JSON array of strings, no other text.

Blog content:
${content.substring(0, 4000)}

Response format: ["post 1", "post 2", "post 3", "post 4"]`;

  // Try LM Studio first (local)
  if (lmStudioUrl) {
    try {
      const response = await fetch(`${lmStudioUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.LM_STUDIO_MODEL || 'local-model',
          messages: [
            { role: 'system', content: 'You are a helpful social media content assistant. Always respond with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        const posts = parsePostsFromResponse(text);
        if (posts.length > 0) return posts;
      }
    } catch (err) {
      console.warn('LM Studio request failed, falling back:', err);
    }
  }

  // Try OpenAI as fallback
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful social media content assistant. Always respond with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        const posts = parsePostsFromResponse(text);
        if (posts.length > 0) return posts;
      }
    } catch (err) {
      console.warn('OpenAI request failed:', err);
    }
  }

  // Fallback: generate basic posts from content
  return generateFallbackPosts(content);
}

// Parse JSON array from LLM response
function parsePostsFromResponse(text: string): string[] {
  try {
    // Try to find JSON array in the response
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(p => p.length > 0);
      }
    }
  } catch {
    // If JSON parsing fails, try splitting by newlines
    const lines = text.split('\n').filter(l => l.trim().length > 10);
    if (lines.length > 0) return lines.slice(0, 4);
  }
  return [];
}

// Fallback post generation when AI services are unavailable
function generateFallbackPosts(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keywords = content.match(/\b[A-Z][a-z]{3,}\b/g) || [];
  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 5);

  const posts: string[] = [];

  if (sentences.length > 0) {
    posts.push(
      `🚀 ${sentences[0].trim().substring(0, 200)}... #ContentMarketing #${uniqueKeywords[0] || 'Growth'}`
    );
  }
  if (sentences.length > 1) {
    posts.push(
      `💡 Key insight: ${sentences[1].trim().substring(0, 200)}... #${uniqueKeywords[1] || 'Tips'} #Strategy`
    );
  }
  if (sentences.length > 2) {
    posts.push(
      `📈 ${sentences[2].trim().substring(0, 200)}... #${uniqueKeywords[2] || 'Marketing'} #ContentStrategy`
    );
  }

  posts.push(
    `🎯 Want to learn more? Check out our latest blog post for the full breakdown. #ContentCreation #${uniqueKeywords[3] || 'SocialMedia'}`
  );

  return posts.slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const { content, email } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    if (content.length > 50000) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length of 50,000 characters' },
        { status: 400, headers: getCorsHeaders(request) }
      );
    }

    // Check if Appwrite is configured and enabled
    const useAppwrite = process.env.USE_APPWRITE_GENERATE === 'true';
    const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

    if (useAppwrite && appwriteProjectId && appwriteProjectId !== 'your-project-id-here') {
      // Use Appwrite function
      try {
        const response = await fetch(
          `${appwriteEndpoint}/v1/functions/generate-posts/execute`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': appwriteProjectId,
            },
            body: JSON.stringify({ content, email }),
            signal: AbortSignal.timeout(30000),
          }
        );

        if (response.ok) {
          const result = await response.json();
          return NextResponse.json(result, { headers: getCorsHeaders(request) });
        }

        console.warn('Appwrite function failed, falling back to local processing');
      } catch (err) {
        console.warn('Appwrite request failed, falling back to local processing:', err);
      }
    }

    // Default: generate posts locally
    const posts = await generatePostsLocally(content);

    return NextResponse.json(
      { posts },
      { headers: getCorsHeaders(request) }
    );
  } catch (error: any) {
    console.error('Error generating posts:', error);
    return NextResponse.json(
      { error: 'Failed to generate posts' },
      { status: 500, headers: getCorsHeaders(request) }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(request),
      'Access-Control-Max-Age': '86400',
    },
  });
}
