'use client'

import ProductCard from '@/components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Download, Shield, Zap, ArrowRight } from 'lucide-react'
import productsData from '@/data/products.json'

interface Product {
  id: string
  name: string
  price: number
  displayPrice: string
  stripePriceIdEnv: string
  description: string
  features: string[]
  category: string
  file: string
  badge?: string | null
}

const products: Product[] = productsData as unknown as Product[]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Templates & Tools
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Boost Your Productivity<br />
          <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            With Ready-Made AI Tools
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Instant digital downloads. No subscriptions. No hassle. Just plug-and-play templates that save you hours every week.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <Badge variant="secondary"><Download className="w-3 h-3 mr-1" /> Instant Download</Badge>
          <Badge variant="secondary"><Shield className="w-3 h-3 mr-1" /> 48-Hr Refund Policy</Badge>
          <Badge variant="secondary"><Zap className="w-3 h-3 mr-1" /> Ready in Minutes</Badge>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">5+</div>
              <div className="text-sm text-gray-500">Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-500">Digital Delivery</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">$7-$12</div>
              <div className="text-sm text-gray-500">Price Range</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{"<"}60s</div>
              <div className="text-sm text-gray-500">Delivery Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-2">Browse All Products</h2>
        <p className="text-gray-500 text-center mb-8">Each product is a ready-to-use digital download</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              displayPrice={product.displayPrice}
              description={product.description}
              features={product.features}
              category={product.category}
              badge={product.badge}
            />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How do I receive my purchase?', a: 'Immediately after payment, you\'ll be redirected to a download page. You\'ll also receive an email with the download link.' },
            { q: 'What format are the products?', a: 'Most products are PDF downloads. Templates come as ZIP files containing Excel/Notion-compatible formats.' },
            { q: 'Can I get a refund?', a: 'Yes! We offer a 48-hour no-questions-asked refund policy. Just contact us and we\'ll process it right away.' },
            { q: 'Do these work with any AI tool?', a: 'Our prompts are designed to work with ChatGPT, Claude, Gemini, and other major AI platforms.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-600 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Save Time?</h2>
          <p className="text-pink-100 mb-6">Join thousands of professionals using our AI templates to work smarter, not harder.</p>
          <a href="#products" className="inline-flex items-center gap-2 bg-white text-pink-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Browse Products <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PromptShop. All rights reserved.</p>
          <p className="mt-2">Secure payments powered by Stripe</p>
        </div>
      </footer>
    </div>
  )
}
