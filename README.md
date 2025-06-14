## [Lexi-Guess](https://lexi-guess.vercel.app/)

A lexical categorical guessing game with customizable options to make things interesting. Challenge yourself with different word lengths, input your own categories that are meaningful to you, and up the ante with adjustable difficulty levels!

## Planned Features

- Categories based on user input
- Customizable word length
- Internationalization support
    - Add Polish language support
- Strengthen security in current back-end approach by restructuring APIs 
    - Create /new-game and /submit-guess API so that answer never gets sent 
- Difficulty levels
    - Incorporate accents for Hard difficulty
- Time trial option
- Disable highlighting for letters that are in word but not in correct position
- Colorblind settings
- Multi-player, i.e. joinable room where the first person to guess wins the round
- Daily word challenge
- Hints for guessing word
- History of all rounds

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
