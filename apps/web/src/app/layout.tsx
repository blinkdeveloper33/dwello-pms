import type { Metadata } from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Background from '@/components/Background';

const inter = Inter({ subsets: ['latin'] });
const caveat = Caveat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
});

export const metadata: Metadata = {
  title: 'Dwello. PMS - Property Management System',
  description: 'All-in-one Property + Condo/HOA Management OS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${caveat.variable}`}>
        <Background />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

