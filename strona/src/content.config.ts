import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const caseStudies = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content/case-studies" }),
	schema: z.object({
		order: z.number(),
		title: z.string(),
		summary: z.string(),
		scale: z.string().optional(),
		stack: z.array(z.string()).min(1),
		status: z.string(),
		codeVisibility: z.enum(["public", "private"]),
		codeNote: z.string().optional(),
		repoUrl: z.string().url().optional(),
		screenshots: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
	}),
});

export const collections = { "case-studies": caseStudies };
