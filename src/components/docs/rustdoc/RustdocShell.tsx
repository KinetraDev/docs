"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";

import {
  SidebarItem,
  useFolderDepth,
} from "fumadocs-ui/components/sidebar/base";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Item, Node, Root } from "fumadocs-core/page-tree";

import { icons } from "lucide-react";

import { linkItems } from "@/config.layout";

import { RustdocProvider, useRustdoc } from "./RustdocProvider";
import { LogoText } from "@/components/shared/Logo";
import type { RustdocSourceConfig } from "@/lib/rustdoc/rustdoc";

interface RustdocShellProps {
  children: ReactNode;
  sources: RustdocSourceConfig[];
  staticTree: Root;
}

export function RustdocShell({
  children,
  sources,
  staticTree,
}: RustdocShellProps) {
  const treeWithIcons = useMemo(() => reviveIcons(staticTree), [staticTree]);

  return (
    <RustdocProvider staticTree={treeWithIcons} sources={sources}>
      <DocsShellLayout>{children}</DocsShellLayout>
    </RustdocProvider>
  );
}

function reviveIcons(tree: Root): Root {
  return reviveRoot(tree);
}

function reviveRoot(root: Root): Root {
  return {
    ...root,
    children: root.children.map(reviveNode),
    fallback: root.fallback ? reviveRoot(root.fallback) : undefined,
  };
}

function reviveNode(node: Node): Node {
  const icon =
    "icon" in node && typeof node.icon === "string"
      ? createIcon(node.icon)
      : "icon" in node
        ? node.icon
        : undefined;

  if (node.type === "folder") {
    return {
      ...node,
      icon,
      index: node.index ? (reviveNode(node.index) as Item) : undefined,
      children: node.children.map(reviveNode) as Node[],
    };
  }

  if ("icon" in node) {
    return {
      ...node,
      icon,
    };
  }

  return { ...node };
}

function createIcon(iconName: string) {
  const Icon = icons[iconName as keyof typeof icons];
  return Icon ? <Icon /> : undefined;
}

function DocsShellLayout({ children }: { children: ReactNode }) {
  const { mergedTree, getNodeSection } = useRustdoc();

  return (
    <DocsLayout
      tree={mergedTree}
      links={linkItems.filter((item) => item.type === "icon")}
      nav={{ title: <LogoText /> }}
      sidebar={{
        components: {
          Item: SidebarTreeItem,
        },
        tabs: {
          transform: (option, node) => {
            if (!node.icon) return option;

            const docSection = getNodeSection(node);
            if (!docSection) return option;

            const color = `var(--doc-color-${docSection}, var(--color-fd-foreground))`;

            return {
              ...option,
              icon: (
                <div
                  className="[&_svg]:size-full rounded-lg size-full text-(--tab-color) max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5"
                  style={{ "--tab-color": color } as CSSProperties}
                >
                  {node.icon}
                </div>
              ),
            };
          },
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}

function SidebarTreeItem({ item }: { item: Item }) {
  const pathname = usePathname();
  const depth = useFolderDepth();

  if (item.$id?.includes(":loading:")) {
    return <RustdocSidebarSkeleton />;
  }

  return (
    <SidebarItem
      active={pathname === item.url}
      className="relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5 data-[active=true]:before:w-px data-[active=true]:before:bg-fd-primary [&_svg]:size-4 [&_svg]:shrink-0"
      external={item.external}
      href={item.url}
      icon={item.icon}
      style={{ paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }}
    >
      {item.name}
    </SidebarItem>
  );
}

function RustdocSidebarSkeleton() {
  const depth = useFolderDepth();

  return (
    <div
      className="flex flex-col gap-3 py-2"
      style={{ paddingInlineStart: `calc(${2 + 3 * depth} * var(--spacing))` }}
      title="Loading rustdoc"
    >
      {[
        "w-32 opacity-100",
        "w-28 opacity-90",
        "w-36 opacity-80",
        "w-24 opacity-65",
        "w-32 opacity-50",
        "w-28 opacity-35",
        "w-20 opacity-20",
      ].map((className) => (
        <div
          className={`${className} h-3 animate-pulse rounded bg-fd-muted`}
          key={className}
        />
      ))}
    </div>
  );
}
