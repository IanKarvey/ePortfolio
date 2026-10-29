import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* One markdown file per project in src/content/projects/.
   To add a project: copy an existing file, change the fields, write the story below the ---. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),                 // one line under the title
    summary: z.string(),                 // the paragraph on the home page list
    order: z.number(),                   // position on the home page (1 = first)
    type: z.string(),                    // e.g. "Capstone Project", "Client Commission"
    year: z.number(),
    period: z.string().optional(),       // the dates shown on the CV, e.g. "September 2025 – October 2026"
    status: z.string(),
    role: z.string(),
    client: z.string().optional(),
    platform: z.string(),
    stack: z.array(z.string()),
    logo: z.string(),                    // path under /public
    logoBg: z.string().default('transparent'),
    accent: z.string(),                  // project colour used on its page
    demo: z.enum(['barangay', 'bakery', 'delivery']).optional(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })),
    features: z.array(z.object({ title: z.string(), text: z.string() })),
    architecture: z.array(z.object({ name: z.string(), tech: z.string(), text: z.string() })),
  }),
});

export const collections = { projects };
