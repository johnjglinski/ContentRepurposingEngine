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
