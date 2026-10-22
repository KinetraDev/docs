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

  test("a docs content page renders its heading", async ({ page }) => {
    await page.goto("/docs/intro/faq");

    await expect(
      page.getByRole("heading", { name: /Frequently Asked Questions/i }),
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
    expect(await res.text()).toContain("/docs/intro/ethercat");
  });
});
