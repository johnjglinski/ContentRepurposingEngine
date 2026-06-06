# User Feedback Collection System

**Purpose:** Capture, analyze, and act on user feedback to continuously improve Content Repurposing Engine.

---

## 📥 Feedback Channels

### 1. In-App Feedback Widget (Primary)
A lightweight feedback form embedded in the dashboard that appears after content generation.

**Trigger:** After successful post generation or every 5th use session.
**Location:** Bottom-right corner of `/dashboard` page.
**Fields:** Rating (1-5 stars), Category dropdown, Free-text comment, Email (optional).

### 2. Email Feedback Requests (Secondary)
Automated emails sent at Day 3 and Day 14 post-signup requesting feedback.

**Templates:** See MARKETING_ASSETS.md for email copy.
**Tracking:** Open rate, reply rate, sentiment of responses.

### 3. GitHub Issues (Technical Feedback)
Public issue tracking for bugs, feature requests, and improvements.

**Labels:** `bug`, `enhancement`, `feature-request`, `ux-improvement`, `performance`
**Milestone:** Grouped by sprint/release cycle.

### 4. Social Media Listening (Passive)
Monitor mentions on Twitter/X, Reddit, LinkedIn for unsolicited feedback.

**Tools:** Native platform search + Google Alerts for "Content Repurposing Engine"

---

## 🔧 In-App Feedback Component Implementation

### Component: `FeedbackWidget.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, X, Star, Send } from 'lucide-react'

type FeedbackCategory = 'bug' | 'feature-request' | 'ux-improvement' | 'general' | 'pricing'

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) return

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, category, comment, email }),
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setIsOpen(false)
        setRating(0)
        setComment('')
        setEmail('')
      }, 3000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Give feedback"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-[80vh] overflow-y-auto shadow-xl z-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm">Share your feedback</h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium">Thank you! 🎉</p>
            <p className="text-xs text-gray-500 mt-1">Your feedback helps us improve.</p>
          </div>
        ) : (
          <>
            {/* Star Rating */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-yellow-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${star <= (hoveredStar || rating) ? 'fill-current' : ''}`}
                  />
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              className="w-full text-sm border rounded-md p-2 mb-3 bg-white"
            >
              <option value="general">General feedback</option>
              <option value="bug">Report a bug</option>
              <option value="feature-request">Feature request</option>
              <option value="ux-improvement">UX improvement</option>
              <option value="pricing">Pricing feedback</option>
            </select>

            {/* Comment */}
            <Textarea
              placeholder="What can we improve?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-sm mb-3"
              rows={3}
            />

            {/* Email (optional) */}
            <input
              type="email"
              placeholder="Email (optional — for follow-up)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm border rounded-md p-2 mb-3"
            />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || !comment.trim()}
              className="w-full text-sm"
            >
              <Send className="w-4 h-4 mr-1" /> Send Feedback
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

### API Route: `src/app/api/feedback/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { rating, category, comment, email } = await request.json()

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 })
    }

    // Store feedback (Appwrite database or local JSON for now)
    const feedbackEntry = {
      id: crypto.randomUUID(),
      rating,
      category,
      comment,
      email: email || null,
      timestamp: new Date().toISOString(),
      source: 'in-app-widget',
    }

    // TODO: Store in Appwrite database collection "feedback"
    // For now, log to console (replace with DB write in production)
    console.log('New feedback:', JSON.stringify(feedbackEntry))

    return NextResponse.json({ success: true, id: feedbackEntry.id })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
```

### Integration Steps
1. Create `src/components/FeedbackWidget.tsx` with the component code above
2. Create `src/app/api/feedback/route.ts` with the API route above
3. Import and add `<FeedbackWidget />` to `src/app/layout.tsx` (inside `<body>`)
4. Deploy Appwrite database collection for feedback storage

---

## 📊 Feedback Analysis Framework

### Weekly Review Process

| Step | Action | Frequency | Owner |
|------|--------|-----------|-------|
| 1 | Export all new feedback entries | Every Monday | Product |
| 2 | Categorize by type (bug/feature/UX/pricing) | Every Monday | Product |
| 3. Calculate average rating trend | Weekly | Analytics |
| 4 | Identify top 3 recurring themes | Every Monday | Product |
| 5 | Prioritize action items for sprint | Sprint planning | Team |
| 6 | Close the loop with respondents | Within 48hrs | Support |

### Sentiment Scoring

| Rating | Sentiment | Action Required |
|--------|-----------|-----------------|
| 5 stars | Positive | Thank user, consider testimonial |
| 4 stars | Satisfied | Note suggestions for backlog |
| 3 stars | Neutral | Investigate pain points |
| 2 stars | Dissatisfied | Prioritize fix, reach out personally |
| 1 star | Negative | Immediate investigation + outreach |

### Feedback Metrics Dashboard

Track these KPIs weekly:
- **NPS Score** (Net Promoter Score): % promoters - % detractors
- **Average Rating**: Mean of all ratings this period
- **Response Rate**: % of users who submit feedback when prompted
- **Resolution Time**: Average time from feedback to action
- **Top Categories**: Distribution by bug/feature/UX/pricing

---

## 🔄 Closing the Loop

### Response Templates

**Positive Feedback (4-5 stars):**
```
Thanks for the great feedback, [Name]! We're thrilled you're enjoying Content Repurposing Engine. Your input helps us keep improving. If you have any feature suggestions, we'd love to hear them!
```

**Constructive Feedback (3 stars):**
```
Thanks for sharing your thoughts, [Name]. I appreciate the honest feedback about [specific point]. We're working on improvements in this area and will keep you posted on our progress.
```

**Negative Feedback (1-2 stars):**
```
Hi [Name], thank you for taking the time to share your experience. I'm sorry we didn't meet your expectations with [specific issue]. I'd love to understand more so we can fix this. Could you reply with a bit more detail? Your feedback directly shapes our roadmap.
```

---

## 📋 Feedback Storage Schema (Appwrite Database)

### Collection: `feedback`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$id` | UUID | Auto | Unique identifier |
| `rating` | Integer (1-5) | Yes | Star rating |
| `category` | String | Yes | bug, feature-request, ux-improvement, pricing, general |
| `comment` | Text | Yes | User's feedback text |
| `email` | Email | No | Optional contact email |
| `timestamp` | DateTime | Auto | When feedback was submitted |
| `source` | String | Yes | in-app-widget, email, github, social |
| `status` | String | Yes | new, reviewed, in-progress, resolved, dismissed |
| `response_sent` | Boolean | No | Whether we replied to the user |
