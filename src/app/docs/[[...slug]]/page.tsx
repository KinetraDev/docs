import path from "node:path";

import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";
import { type ComponentPropsWithoutRef, Fragment } from "react";

import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
} from "fumadocs-ui/page";

import { DotIcon } from "lucide-react";

import { docsSource, getDocsMdxPath, RUSTDOC_SOURCES } from "@/lib/content";
import {
  DOCS_GITHUB_BRANCH,
  DOCS_GITHUB_OWNER,
  DOCS_GITHUB_REPO,
} from "@/config";
import { getMDXComponents } from "@/mdx-components";

import { AiActions, CopyMarkdownButton } from "@/components/docs/PageActions";
import { PageLink } from "@/components/docs/PageLink";
import { RustdocPage } from "@/components/docs/rustdoc/RustdocPage";
import { Person } from "@/components/shared/Person";
import { SafeLink } from "@/components/shared/SafeLink";
import { normalizeRustdocJson } from "@/lib/rustdoc/normalize-rustdoc-json";
import {
  getRustdocPageSlug,
  getRustdocSourceForSlug,
  getRustdocSourceSlugPrefix,
  type RustdocSourceConfig,
} from "@/lib/rustdoc/rustdoc";
import { getRustdocStaticSlugsFromJson } from "@/lib/rustdoc/utils";
import { metadataGenerator } from "@/lib/util/metadata";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) redirect("/docs/intro");

  const rustdocSource = getRustdocSourceForSlug(RUSTDOC_SOURCES, params.slug);
  if (rustdocSource) return <RustdocPage slug={params.slug} />;

  const page = docsSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const mdxUrl = getDocsMdxPath(page);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      lastUpdate={
        page.data.lastModified ? new Date(page.data.lastModified) : undefined
      }
      tableOfContent={{ style: "clerk" }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}

        {page.data.authors.length > 0 && (
          <span className="text-xs text-fd-muted-foreground pt-2 flex items-center gap-2">
            <span className="font-semibold">Written by</span>
            <span className="flex items-center gap-[0.1rem]">
              {page.data.authors.map((author, i) => (
                <Fragment key={author}>
                  {i > 0 && <DotIcon className="size-3 -mx-0.5" />}
                  <Person personId={author} />
                </Fragment>
              ))}
            </span>
          </span>
        )}
      </DocsDescription>

      <div className="flex flex-row items-center justify-between border-b pb-6">
        <div className="flex flex-row gap-2 items-center">
          <AiActions markdownUrl={mdxUrl} />
          <CopyMarkdownButton markdownUrl={mdxUrl} />
        </div>

        <div className="flex flex-row gap-2 items-center">
          <EditOnGitHub
            href={`https://github.com/${DOCS_GITHUB_OWNER}/${DOCS_GITHUB_REPO}/edit/${DOCS_GITHUB_BRANCH}/${page.absolutePath}`}
          />
        </div>
      </div>

      <DocsBody className="docs-body">
        <MDX
          components={getMDXComponents({
            a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
              const found = docsSource.getPageByHref(href ?? "", {
                dir: path.dirname(page.path),
              });

              // link is not a docs page
              if (!found) return <SafeLink {...props} href={href as Route} />;
              return (
                <PageLink
                  page={{
                    url: found.page.url,
                    data: {
                      title: found.page.data.title,
                      description: found.page.data.description,
                      icon: found.page.data.icon,
                    },
                    hash: found.hash,
                  }}
                  {...props}
                >
                  {props.children ?? <>{found.page.data.title}</>}
                </PageLink>
              );
            },
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const rustdocParams = await Promise.all(
    RUSTDOC_SOURCES.map(async (source) => {
      const prefix = getRustdocSourceSlugPrefix(source);
      const slugs = getStaticSlugsForRustdocSource(source);

      return slugs.map((slug) => ({ slug: [...prefix, ...slug] }));
    }),
  );

  return [
    { slug: [] },
    ...docsSource.generateParams(),
    ...rustdocParams.flat(),
  ];
}


export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return {};

  const rustdocSource = getRustdocSourceForSlug(RUSTDOC_SOURCES, slug);
  if (rustdocSource) {
    const metadata = getStaticMetadataForRustdocSource(rustdocSource, slug);

    return metadataGenerator({
      title: metadata?.title ?? rustdocSource.slug,
      description: metadata?.description ?? "Runtime-loaded rustdoc",
    })();
  }

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const generate = metadataGenerator({
    title: page.data.title,
    description: page.data.description,
    docsPage: page,
  });

  return generate();
}

function getStaticMetadataForRustdocSource(
  source: RustdocSourceConfig,
  slug: string[],
): { title?: string; description?: string } | undefined {
  if (source.url !== "/debug/rustdoc.json") return;

  const pageSlug = getRustdocPageSlug(source, slug);
  const json = normalizeRustdocJson(debugRustdoc);
  const page = json.pages.find((candidate) => {
    const candidateSlug = candidate.slugs ?? [];
    return candidateSlug.join("/") === pageSlug.join("/");
  });

  if (page) {
    return {
      title: page.data.title,
      description: page.data.description,
    };
  }

  const meta = json.metas.find((candidate) => {
    const metaSlug = candidate.path.replace(/\/?meta\.json$/, "").split("/");
    const normalizedMetaSlug =
      metaSlug.length === 1 && metaSlug[0] === "" ? [] : metaSlug;

    return normalizedMetaSlug.join("/") === pageSlug.join("/");
  });

  return meta?.data;
}
