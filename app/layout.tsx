import './globals.css';
import type { Metadata } from 'next';
import { Inter, Fredoka } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const fredoka = Fredoka({ 
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'StoryWeaver - Create Magical Stories for Your Child',
  description: 'Create personalized, magical stories for your children with the help of AI. Every story is unique and tailored to your child\'s interests.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${fredoka.variable}`}>
        {children}
      </body>
    </html>
  );
}