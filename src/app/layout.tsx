import type { Metadata } from 'next';
import { Roboto, Roboto_Mono } from 'next/font/google';
import '../styles/index.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';
import { ThemeModeMenu } from '@/components/ThemeModeMenu';

const fontSans = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
});
const fontMono = Roboto_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'MDX Syntax Highlighting',
  description: 'An example of syntax highlighting in MDX.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'h-svh bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="static top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <h4>Syntax Highlighting</h4>
            <div className="ml-auto">
              <ThemeModeMenu />
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
