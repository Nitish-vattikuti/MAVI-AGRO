import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAVI | Premium Farm Management",
  description: "Fresh organic produce management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isHandling = false;
                function handleChunkError(err) {
                  if (isHandling) return;
                  var msg = (err && (err.message || (err.reason && err.reason.message) || String(err))) || '';
                  if (
                    msg.indexOf('Failed to load chunk') !== -1 ||
                    msg.indexOf('Loading chunk') !== -1 ||
                    msg.indexOf('ChunkLoadError') !== -1 ||
                    msg.indexOf('Failed to fetch dynamically imported module') !== -1
                  ) {
                    isHandling = true;
                    var key = 'mavi_chunk_reload';
                    var last = sessionStorage.getItem(key);
                    var now = Date.now();
                    if (!last || now - parseInt(last, 10) > 8000) {
                      sessionStorage.setItem(key, String(now));
                      window.location.reload();
                    }
                  }
                }
                window.addEventListener('error', function(e) { handleChunkError(e.error || e); });
                window.addEventListener('unhandledrejection', function(e) { handleChunkError(e.reason); });
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
