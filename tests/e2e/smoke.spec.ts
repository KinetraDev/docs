import { expect, test } from "@playwright/test";

test.describe("Kinetra site smoke tests", () => {
  test("marketing homepage renders hero and primary CTA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Motion Control/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Get started/i }).first(),
    ).toBeVisible();
  });

  test("docs landing page renders the navigation tree", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByRole("link", { name: /Frequently Asked Questions/i }).first(),
    ).toBeVisible();
  });

  test("a docs content page renders its heading", async ({ page }) => {
    await page.goto("/docs/intro/faq");

    await expect(
      page.getByRole("heading", { name: /Frequently Asked Questions/i }),
    ).toBeVisible();
  });

  test("docs search finds a page and navigates to it", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    // Fumadocs binds Ctrl/Cmd+K globally to open the search dialog.
    await page.keyboard.press("ControlOrMeta+k");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const searchInput = dialog.locator("input").first();
    await searchInput.fill("ethercat");

    // Results render as selectable buttons inside the dialog.
    const result = dialog.getByRole("button", { name: /EtherCAT/i }).first();
    await expect(result).toBeVisible();
    await result.click();

    await expect(page).toHaveURL(/\/docs\/intro\/ethercat/);
    await expect(
      page.getByRole("heading", { name: "EtherCAT", exact: true }).first(),
    ).toBeVisible();
  });

  test("llms.txt is served with documentation content", async ({ request }) => {
    const res = await request.get("/llms.txt");

    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toContain("Kinetra Documentation");
  });

  test("static search index API returns indexed pages", async ({ request }) => {
    const res = await request.get("/api/search.json");

    expect(res.ok()).toBeTruthy();
    // The endpoint serves a serialized Orama index; its document store lists
    // every indexed page URL.
    const body = (await res.json()) as {
      internalDocumentIDStore?: { internalIdToId?: string[] };
    };
    const indexedIds = body.internalDocumentIDStore?.internalIdToId ?? [];
    expect(indexedIds.length).toBeGreaterThan(0);
    expect(indexedIds.some((id) => id.includes("/docs/intro/ethercat"))).toBe(
      true,
    );
  });
});
