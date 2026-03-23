import './globals.css'

export const metadata = {
  title: 'Swami Markets',
  description: 'Prediction Markets Oracle',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
