import { getSerializableDocsPageTree, RUSTDOC_SOURCES } from "@/lib/content";
import { SITE_NAME } from "@/config";

import { RustdocShell } from "@/components/docs/rustdoc/RustdocShell";
import { metadataGenerator } from "@/lib/util/metadata";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const staticTree = getSerializableDocsPageTree();

  return (
    <RustdocShell sources={RUSTDOC_SOURCES} staticTree={staticTree}>
      {children}
    </RustdocShell>
  );
}

export const generateMetadata = metadataGenerator({
  title: {
    template: `%s | ${SITE_NAME} Documentation`,
    default: `${SITE_NAME} Documentation`,
  },
});
