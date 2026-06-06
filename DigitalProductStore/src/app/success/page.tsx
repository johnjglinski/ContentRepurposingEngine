'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, ArrowLeft } from 'lucide-react'
import productsData from '@/data/products.json'

interface Product {
  id: string;
  name: string;
  file: string;
}

const products: Product[] = productsData as unknown as Product[];

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const product = products.find(p => p.id === productId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase. Your download is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {product ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600 mt-1">Digital download ready</p>
              </div>

              {/* In production, this would link to the actual file or trigger email delivery */}
              <Button size="lg" className="w-full gap-2" asChild>
                <a href={product.file} download>
                  <Download className="w-4 h-4" />
                  Download Now
                </a>
              </Button>

              <p className="text-xs text-gray-500">
                A confirmation email with your download link has been sent to your inbox.
              </p>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">Your Purchase</p>
                <p className="text-sm text-gray-600 mt-1">Digital download ready</p>
              </div>

              <Button size="lg" className="w-full gap-2" asChild>
                <a href="/" download>
                  <Download className="w-4 h-4" />
                  Download Now
                </a>
              </Button>
            </>
          )}

          <div className="border-t pt-4">
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
