import { _electron } from "playwright";
import { test, expect } from "@playwright/test";

test("the user can insert superscripts", async () => {
	const electronApp = await _electron.launch({ args: ["compiled/main.js"] });
	const page = await electronApp.firstWindow();
	await page.waitForLoadState();
	await expect(page.locator(".cursor")).toBeVisible();

	await page.keyboard.press("x");
	await page.keyboard.down("Shift");
	await page.keyboard.press("^");
	await page.keyboard.up("Shift");
	await page.keyboard.press("2");
	try {
		await expect(page).toHaveScreenshot("image.png");
	}
	finally {
		await electronApp.close();
	}
});
