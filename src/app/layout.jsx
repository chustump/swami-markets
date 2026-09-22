import "./globals.css";

export const metadata = {
  title: "Synadia Sales OS",
  description:
    "Discovery, pitch, objections, and next step for selling Synadia and NATS — the decision tree a rep runs on a live call.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
