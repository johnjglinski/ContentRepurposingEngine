'use client'

import { Badge } from '@/components/ui/badge'

interface ScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreGauge({ score, size = 'lg' }: ScoreGaugeProps) {
  const radius = size === 'lg' ? 80 : size === 'md' ? 60 : 40
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 75) return '#22c55e'
    if (s >= 50) return '#f59e0b'
    if (s >= 25) return '#f97316'
    return '#ef4444'
  }

  const getLabel = (s: number) => {
    if (s >= 85) return 'Excellent'
    if (s >= 70) return 'Good'
    if (s >= 50) return 'Fair'
    if (s >= 30) return 'Needs Work'
    return 'Poor'
  }

  const fontSize = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg'
  const labelSize = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className="flex flex-col items-center">
      <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        <span className={`${fontSize} font-bold text-gray-900`}>{score}%</span>
        <Badge variant={score >= 70 ? 'success' : 'default'} className={`mt-1 ${labelSize}`}>
          {getLabel(score)}
        </Badge>
      </div>
    </div>
  )
}
