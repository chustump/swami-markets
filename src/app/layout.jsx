import './globals.css'

export const metadata = {
  title: 'Swami Says — the prediction markets oracle',
  description: 'Sit with the Swami: playful, data-driven reads on prediction markets, plus a Kalshi edge scanner with an honest backtest.',
}

export const viewport = { themeColor: '#0b0716', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="sky" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
