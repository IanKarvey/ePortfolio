import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Every page is pre-rendered to static HTML; only /api/chat opts out
// (it runs as a Vercel serverless function so the Gemini key never reaches the browser).
export default defineConfig({
  site: 'https://karveyportfolio.vercel.app',
  output: 'static',
  adapter: vercel({ maxDuration: 60 }),
});
