import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare, GeistPixelGrid, GeistPixelLine } from 'geist/font/pixel'
import { siteConfig } from '@/config/site'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MatrixRain } from '@/components/ascii/matrix-rain'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'ML Engineer',
    'Machine Learning',
    'Backend Developer',
    'Quantitative Trading',
    'Python',
    'FastAPI',
    'XGBoost',
    'LightGBM',
    'PyTorch',
    'Next.js',
    'TypeScript',
    'Warsaw',
    'Poland',
    'AI Engineer',
    'LLM',
    'RAG',
  ],
  authors: [{ name: 'Kacper Saks' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kacper Saks',
  jobTitle: 'ML & Backend Engineer',
  url: siteConfig.url,
  sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Warsaw',
    addressCountry: 'PL',
  },
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'Silesian University of Technology',
    },
    { '@type': 'EducationalOrganization', name: '42 School Warsaw' },
  ],
  knowsAbout: [
    'Machine Learning',
    'Quantitative Trading',
    'Python',
    'FastAPI',
    'XGBoost',
    'PyTorch',
    'LLM',
    'RAG',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${GeistMono.variable} ${GeistPixelSquare.variable} ${GeistPixelGrid.variable} ${GeistPixelLine.variable} font-mono antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <MatrixRain />
        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
