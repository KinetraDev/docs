import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import {
  defineCollections,
  defineConfig,
  defineDocs,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";

import { z } from "zod";

export const docs = defineDocs({
  docs: {
    schema: pageSchema.extend({
      authors: z.array(z.string()),
      keywords: z.optional(z.array(z.string())),
    }),
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
});

export const people = defineCollections({
  dir: "content/people",
  type: "doc",
  schema: pageSchema.extend({
    nickname: z.optional(z.string()),
    picture: z.optional(z.string()),
    location: z.optional(z.string()),
    socials: z.optional(
      z.object({
        website: z.optional(z.string()),
        github: z.optional(z.string()),
        instagram: z.optional(z.string()),
        youtube: z.optional(z.string()),
      }),
    ),
  }),
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkCodeTabOptions: { parseMdx: true },
    remarkPlugins: [remarkMdxMermaid],
  },
});
