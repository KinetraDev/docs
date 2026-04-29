import { DOCS_GITHUB_OWNER } from "@/config";

import { ClientRedirect } from "@/components/shared/ClientRedirect";

const RedirectGithubPage = () => (
  <ClientRedirect href={`https://github.com/${DOCS_GITHUB_OWNER}`} />
);
export default RedirectGithubPage;
