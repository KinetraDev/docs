import type { Route } from "next";

import type { Folder, Item, Node, Root } from "fumadocs-core/page-tree";
import type { InferPageType } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

import { docs, people } from "collections/server";

import type { RustdocSourceConfig } from "@/lib/rustdoc/rustdoc";

const LLM_MDX_SUFFIX = ".md";

export const peopleSource = loader({
  baseUrl: "/people",
  source: toFumadocsSource(people, []),
  plugins: [lucideIconsPlugin()],
});

export type PersonPage = InferPageType<typeof peopleSource>;

export const docsSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export type DocsPage = InferPageType<typeof docsSource>;

export const RUSTDOC_SOURCES: Array<RustdocSourceConfig> =
  docsSource.pageTree.children.flatMap((node) => {
    if (node.type !== "folder" || !node.root) return [];

    const meta = docsSource.getNodeMeta(node);
    const rustdoc = meta?.data.rustdoc;
    if (!meta || !rustdoc) return [];

    return [
      {
        slug: meta.path.split("/")[0],
        url: rustdoc.url,
      },
    ];
  });

export function mergeTrees(staticTree: Root, children: Node[]): Root {
  return {
    ...staticTree,
    children: [...staticTree.children, ...children],
  };
}

export function getSerializableDocsPageTree(): Root {
  return serializeRoot(docsSource.pageTree);
}

function serializeRoot(root: Root): Root {
  return {
    ...root,
    children: root.children.map(serializeNode),
    fallback: root.fallback ? serializeRoot(root.fallback) : undefined,
  };
}

function serializeNode(node: Node): Node {
  if (node.type === "folder") {
    const meta = docsSource.getNodeMeta(node as Folder);

    return {
      ...node,
      icon: meta?.data.icon,
      index: node.index ? (serializeNode(node.index) as Item) : undefined,
      children: node.children.map(serializeNode),
    };
  }

  if (node.type === "page") {
    const page = docsSource.getNodePage(node as Item);

    return {
      ...node,
      icon: page?.data.icon,
    };
  }

  return { ...node };
}

export function getDocsMdxPath(page: DocsPage): Route<`/docs-llm/${string}`> {
  return `/docs-llm/${page.slugs.join("/")}${LLM_MDX_SUFFIX}`;
}

export function getDocsMdxSlug(page: DocsPage): Array<string> {
  const slugs = [...page.slugs]; // make a copy, messes with the build otherwise

  // add md extension
  const last = slugs.pop();
  slugs.push(`${last}${LLM_MDX_SUFFIX}`);

  return slugs;
}

export function getDocsPageFromMdxUrl(
  slug: Array<string>,
): DocsPage | undefined {
  const slugs = [...slug];
  if (slugs.length > 0) {
    const s = slugs.pop();
    if (s) slugs.push(s.replace(LLM_MDX_SUFFIX, ""));
  }
  return docsSource.getPage(slugs);
}

export async function getDocsLLMText(page: DocsPage) {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}

export const OPersonRole = {
  MAINTAINER: "maintainer",
  DOCUMENTATION: "documentation",
  COMMUNITY: "community",
  UI_UX: "ui & ux",
} as const;

type PersonRole = (typeof OPersonRole)[keyof typeof OPersonRole];

export function personHasRole(person: PersonPage, role: PersonRole): boolean {
  return (
    person.data.roles
      ?.map((role) => role.trim().toLowerCase())
      .includes(role) ?? false
  );
}
