import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from '@/shared/providers/Providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexi-Guess - The Ultimate Word Guessing Game",
  description: "Challenge yourself with Lexi-Guess, a modern word-guessing game with customizable options. Test your vocabulary and deduction skills!",
  keywords: ["word game", "puzzle", "vocabulary", "guessing game", "wordle", "lexi-guess"],
  authors: [{ name: "Lexi-Guess Team" }],
  creator: "Lexi-Guess",
  publisher: "Lexi-Guess",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lexi-guess.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Lexi-Guess - The Ultimate Word Guessing Game",
    description: "Challenge yourself with Lexi-Guess, a modern word-guessing game with customizable options. Test your vocabulary and deduction skills!",
    url: 'https://lexi-guess.vercel.app',
    siteName: 'Lexi-Guess',
    images: [
      {
        url: '/icons/lexi-guess.svg',
        width: 1200,
        height: 630,
        alt: 'Lexi-Guess Word Game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Lexi-Guess - The Ultimate Word Guessing Game",
    description: "Challenge yourself with Lexi-Guess, a modern word-guessing game with customizable options. Test your vocabulary and deduction skills!",
    images: ['/icons/lexi-guess.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
