import { NextRequest, NextResponse } from 'next/server';

// Resume analysis API endpoint
// Accepts either JSON (resumeText + jobDescription) or multipart/form-data (file upload)

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let resumeText: string;
    let jobDescription: string;

    if (contentType.includes('application/json')) {
      // JSON body - text file content already extracted client-side
      const body = await request.json();
      resumeText = body.resumeText || '';
      jobDescription = body.jobDescription || '';
    } else if (contentType.includes('multipart/form-data')) {
      // File upload - parse PDF server-side
      const formData = await request.formData();
      const file = formData.get('resume') as File | null;
      jobDescription = (formData.get('jobDescription') as string) || '';

      if (!file) {
        return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
      }

      // Extract text from PDF using pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let extractedText: string;
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(uint8Array);
        extractedText = pdfData.text;
      } catch (parseError) {
        console.error('PDF parse error:', parseError);
        // Fallback: try to read as text
        extractedText = new TextDecoder().decode(uint8Array).slice(0, 10000);
      }

      resumeText = extractedText;
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    if (!resumeText.trim() || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Resume text and job description are required' }, { status: 400 });
    }

    // Import the analyzer (server-side)
    const { analyzeResume } = await import('@/lib/resume-analyzer');

    // Free tier: basic analysis only (no optimized version)
    const result = await analyzeResume(resumeText, jobDescription, false);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
