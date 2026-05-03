import type { FunctionComponent, ReactNode } from "react";

import { RootProvider } from "fumadocs-ui/provider/next";

import { ConsentProvider } from "./ConsentProvider";
import { StaticSearchDialog } from "@/components/root/StaticSearchDialog";

export const Providers: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ConsentProvider>
      <RootProvider search={{ SearchDialog: StaticSearchDialog }}>
        {children}
      </RootProvider>
    </ConsentProvider>
  );
};
