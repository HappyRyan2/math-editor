import { _electron } from "playwright";
import { test, expect } from "@playwright/test";

test("the user can insert various math components, including using autocomplete", async () => {
	const electronApp = await _electron.launch({ args: ["compiled/main.js"], env: { CI: "true" } });
	const page = await electronApp.firstWindow();
	await page.waitForLoadState();
	await expect(page.locator(".cursor")).toBeVisible();

	await page.keyboard.press("x");
	await page.keyboard.down("Shift");
	await page.keyboard.press("^");
	await page.keyboard.up("Shift");
	await page.keyboard.press("2");
	await page.keyboard.press("ArrowRight");
	await page.keyboard.press("+");
	await page.keyboard.press("1");
	await page.keyboard.press("/");
	await page.keyboard.press("3");
	await page.keyboard.down("Shift");
	await page.keyboard.press("(");
	await page.keyboard.up("Shift");
	await page.keyboard.type("alpha");
	await page.keyboard.press("Tab");
	try {
		await expect(page).toHaveScreenshot("math-components.png");
	}
	catch {
		electronApp.close();
	}

	await page.keyboard.press("Enter");
	await page.keyboard.press("Enter");
	await page.keyboard.press("A");
	await page.keyboard.press("B");
	await page.keyboard.press("Enter");
	await page.keyboard.press("A");
	await page.keyboard.press("B");
	await page.keyboard.press("Enter");
	await page.keyboard.press("A");
	await page.keyboard.press("B");

	await page.keyboard.down("Control");
	await page.keyboard.press("ArrowLeft");
	await page.keyboard.up("Control");
	await page.keyboard.press("ArrowLeft");

	await page.keyboard.down("Shift");
	await page.keyboard.press("ArrowLeft");
	await page.keyboard.press("ArrowLeft");
	await page.keyboard.up("Shift");

	await page.keyboard.down("Control");
	await page.keyboard.press("d");
	try {
		await expect(page).toHaveScreenshot("multi-cursoring.png");
	}
	finally {
		electronApp.close();
	}
});
