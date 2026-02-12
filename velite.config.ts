import { defineConfig, defineCollection, s } from 'velite'

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/*.mdx',
  schema: s.object({
    slug: s.slug('projects'),
    title: s.string().max(120),
    description: s.string().max(300),
    date: s.isodate(),
    updated: s.isodate().optional(),
    featured: s.boolean().default(false),
    status: s.enum(['completed', 'in-progress', 'archived']),
    tags: s.array(s.string()),
    github: s.string().optional(),
    live: s.string().optional(),
    stats: s
      .object({
        lines: s.string().optional(),
        sharpe: s.number().optional(),
        strategies: s.number().optional(),
        sources: s.number().optional(),
        modules: s.number().optional(),
        stars: s.number().optional(),
      })
      .optional(),
    body: s.mdx(),
  }),
})

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/*.mdx',
  schema: s.object({
    slug: s.slug('blog'),
    title: s.string().max(120),
    description: s.string().max(300),
    date: s.isodate(),
    updated: s.isodate().optional(),
    published: s.boolean().default(true),
    tags: s.array(s.string()),
    body: s.mdx(),
  }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { projects, posts },
})
