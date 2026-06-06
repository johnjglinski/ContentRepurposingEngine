'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

interface ResumeUploadProps {
  onFileSelect: (file: File) => void
  fileName: string | null
  isAnalyzing: boolean
}

export default function ResumeUpload({ onFileSelect, fileName, isAnalyzing }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      onFileSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}>
      <CardContent className="p-8">
        {!fileName ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & drop your resume here
            </p>
            <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
            <Button variant="outline" size="sm">
              Choose File
            </Button>
            <p className="text-xs text-gray-400 mt-4">PDF or TXT, max 5MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={isAnalyzing}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500">Ready for analysis</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
