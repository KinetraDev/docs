import type { ReactNode } from "react";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

import { getDisplayName, getEntityDeclaration } from "./rustdoc-format";
import type { RustdocEntity } from "./types";

interface EntityHeaderProps {
  entity: RustdocEntity;
  label: string;
}

export function EntityHeader({ entity, label }: EntityHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{label}</Badge>
        {entity.path && <Badge muted>{entity.path}</Badge>}
        {entity.deprecation && <Badge tone="warning">deprecated</Badge>}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {getDisplayName(entity)}
        </h2>
      </div>
    </div>
  );
}

export function EntityScaffold({
  children,
  entity,
  label,
}: {
  children: ReactNode;
  entity: RustdocEntity;
  label: string;
}) {
  return (
    <div className="not-prose space-y-6">
      <EntityHeader entity={entity} label={label} />
      {children}
    </div>
  );
}

export function EntityDeclaration({ entity }: { entity: RustdocEntity }) {
  return (
    <div className="not-prose">
      <DynamicCodeBlock lang="rust" code={getEntityDeclaration(entity)} />
    </div>
  );
}

export function EntityDocs({ docs }: { docs?: string }) {
  if (!docs) {
    return (
      <p className="text-sm text-fd-muted-foreground">
        This item does not include rustdoc prose.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {splitMarkdownByCodeBlocks(docs).map((part) =>
        part.type === "code" ? (
          <div className="not-prose" key={part.key}>
            <DynamicCodeBlock
              lang={normalizeCodeLanguage(part.lang)}
              code={part.code}
            />
          </div>
        ) : (
          <MarkdownText key={part.key} text={part.text} />
        ),
      )}
    </div>
  );
}

export function Badge({
  children,
  muted,
  tone,
}: {
  children: ReactNode;
  muted?: boolean;
  tone?: "warning";
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        muted ? "text-fd-muted-foreground" : "text-fd-foreground",
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "bg-fd-muted/50",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function MarkdownText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block) => {
        if (block.startsWith("# ")) {
          return (
            <h2 key={block} className="mt-8 text-xl font-semibold">
              {block.replace(/^#\s+/, "")}
            </h2>
          );
        }

        if (block.startsWith("## ")) {
          return (
            <h3 key={block} className="mt-6 text-lg font-semibold">
              {block.replace(/^##\s+/, "")}
            </h3>
          );
        }

        if (/^[-*]\s/m.test(block)) {
          return (
            <ul key={block} className="list-disc space-y-1 pl-5">
              {block.split("\n").map((line) => (
                <li key={line}>
                  {renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={block} className="leading-7">
            {renderInlineMarkdown(block)}
          </p>
        );
      })}
    </>
  );
}

function splitMarkdownByCodeBlocks(markdown: string) {
  const parts: Array<
    | { key: string; type: "text"; text: string }
    | { key: string; type: "code"; lang: string; code: string }
  > = [];
  const regex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match = regex.exec(markdown);

  while (match) {
    if (match.index > lastIndex) {
      const text = markdown.slice(lastIndex, match.index);
      parts.push({
        key: `text-${lastIndex}-${text.length}`,
        type: "text",
        text,
      });
    }

    parts.push({
      key: `code-${match.index}-${match[2].length}`,
      type: "code",
      lang: match[1] ?? "",
      code: match[2].trim(),
    });
    lastIndex = regex.lastIndex;
    match = regex.exec(markdown);
  }

  if (lastIndex < markdown.length) {
    const text = markdown.slice(lastIndex);
    parts.push({ key: `text-${lastIndex}-${text.length}`, type: "text", text });
  }

  return parts.filter((part) =>
    part.type === "code" ? part.code.length > 0 : part.text.trim().length > 0,
  );
}

function renderInlineMarkdown(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const parts: ReactNode[] = [];
  const regex =
    /(`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\]\[[^\]]+\])/g;
  let lastIndex = 0;
  let match = regex.exec(normalized);

  while (match) {
    if (match.index > lastIndex) {
      parts.push(normalized.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <code
          className="rounded bg-fd-muted px-1 py-0.5 font-mono text-[0.9em]"
          key={`code-${match.index}-${match[2]}`}
        >
          {match[2]}
        </code>,
      );
    } else if (match[3]) {
      parts.push(
        <strong key={`strong-${match.index}-${match[3]}`}>{match[3]}</strong>,
      );
    } else if (match[4]) {
      parts.push(match[4]);
    } else if (match[6]) {
      parts.push(match[6]);
    }

    lastIndex = regex.lastIndex;
    match = regex.exec(normalized);
  }

  if (lastIndex < normalized.length) {
    parts.push(normalized.slice(lastIndex));
  }

  return parts;
}

function normalizeCodeLanguage(lang: string) {
  const firstPart = lang
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .find(Boolean);

  if (!firstPart) return "text";
  if (
    [
      "ignore",
      "no_run",
      "should_panic",
      "compile_fail",
      "edition2018",
      "edition2021",
      "edition2024",
    ].includes(firstPart)
  ) {
    return "rust";
  }

  return firstPart;
}
