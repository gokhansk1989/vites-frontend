import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Motorya — Motosiklet Ekipman Pazarı',
  description: 'İkinci el motosiklet kıyafet ve aksesuarlarını al ve sat. motorya.com.tr',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
