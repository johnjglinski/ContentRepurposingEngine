// Resume analyzer - uses OpenAI-compatible API (LM Studio or OpenAI)
// Returns structured ATS scoring data

export interface ResumeAnalysisResult {
  overallScore: number
  keywordMatches: string[]
  keywordGaps: string[]
  sectionScores: {
    summary: number
    experience: number
    skills: number
    education: number
  }
  suggestions: string[]
  optimizedVersion?: string // Only available in paid tier
}

const SYSTEM_PROMPT = `You are an ATS (Applicant Tracking System) scoring engine. Analyze the uploaded resume against the provided job description. Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": number (0-100),
  "keywordMatches": ["string", ...],
  "keywordGaps": ["string", ...],
  "sectionScores": {
    "summary": number (0-100),
    "experience": number (0-100),
    "skills": number (0-100),
    "education": number (0-100)
  },
  "suggestions": ["string", ...],
  "optimizedVersion": "rewritten resume text optimized for this role"
}

Be honest and specific. Score based on keyword matching, formatting quality, relevance to the job description, and ATS compatibility.`;

export async function analyzeResume(
  resumeText: string,
  jobDescription: string,
  includeOptimized = false
): Promise<ResumeAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LM_STUDIO_URL;

  // If no API key and no LM Studio URL, return mock data for demo
  if (!apiKey && !process.env.LM_STUDIO_URL) {
    return getMockAnalysis(resumeText, jobDescription);
  }

  const apiUrl = process.env.LM_STUDIO_URL || 'https://api.openai.com/v1';
  const model = process.env.LM_STUDIO_MODEL || 'gpt-4o-mini';
  const key = process.env.OPENAI_API_KEY || 'no-key-required';

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key !== 'no-key-required' ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\n${includeOptimized ? 'Include the optimizedVersion field.' : 'Set optimizedVersion to null.'}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return getMockAnalysis(resumeText, jobDescription);
    }

    // Parse JSON from the response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const parsed = JSON.parse(jsonStr);
    return parsed as ResumeAnalysisResult;
  } catch (error) {
    console.error('AI analysis failed, falling back to mock:', error);
    return getMockAnalysis(resumeText, jobDescription);
  }
}

// Mock analysis for demo/fallback when AI is unavailable
function getMockAnalysis(resumeText: string, jobDesc: string): ResumeAnalysisResult {
  // Generate a deterministic score based on input length and keyword overlap
  const resumeWords = resumeText.toLowerCase().split(/\s+/);
  const jobWords = jobDesc.toLowerCase().split(/\s+/);

  const commonKeywords = ['experience', 'skills', 'management', 'development', 'analysis', 'communication', 'leadership', 'project'];
  const matched = commonKeywords.filter(k => resumeWords.some(w => w.includes(k)) && jobWords.some(j => j.includes(k)));
  const missing = commonKeywords.filter(k => jobWords.some(j => j.includes(k)) && !resumeWords.some(w => w.includes(k)));

  const baseScore = Math.min(90, Math.max(15, (matched.length / commonKeywords.length) * 80 + (resumeText.length > 500 ? 20 : 0)));
  const score = Math.round(baseScore);

  return {
    overallScore: score,
    keywordMatches: matched.length ? matched : ['general experience', 'work history'],
    keywordGaps: missing.length ? missing.slice(0, 5) : ['specific technical skills', 'industry keywords'],
    sectionScores: {
      summary: Math.min(95, score + Math.round(Math.random() * 15)),
      experience: Math.min(95, score + Math.round(Math.random() * 10 - 5)),
      skills: Math.min(95, score + Math.round(Math.random() * 20 - 10)),
      education: Math.min(95, score + Math.round(Math.random() * 10)),
    },
    suggestions: [
      'Add more quantifiable achievements with specific metrics',
      'Include keywords from the job description in your skills section',
      'Use action verbs to start each bullet point',
      missing.length > 0 ? `Consider adding these missing keywords: ${missing.slice(0, 3).join(', ')}` : '',
    ].filter(Boolean) as string[],
  };
}
