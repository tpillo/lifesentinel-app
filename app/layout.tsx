 // app/layout.tsx
import "./globals.css"

export const metadata = {
  title: "Life Sentinel",
  description: "Because Your Loved Ones Deserve Certainty.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground pointer-events-auto">
        {/* Force all app content to be clickable */}
        <div className="relative z-0 pointer-events-auto">{children}</div>
      </body>
    </html>
  )
}