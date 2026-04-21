import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Árajánlat generátor',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hu" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production'}
      </body>
    </html>
  )
}
