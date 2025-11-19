import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'School CTF Platform',
  description: 'Cybersecurity Capture The Flag challenges for students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="bg-gray-900 text-gray-100 text-center text-sm py-4">
          <span>&copy; {new Date().getFullYear()} Adel ElZemity • </span>
          <a
            href="https://adelsamir.com"
            className="text-blue-300 hover:text-blue-200 underline"
            target="_blank"
            rel="noreferrer"
          >
            adelsamir.com
          </a>
        </footer>
      </body>
    </html>
  )
}

