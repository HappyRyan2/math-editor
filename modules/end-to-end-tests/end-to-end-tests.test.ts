import { _electron } from "playwright";
import { test, expect } from "@playwright/test";

test("the user can insert various math components, including using autocomplete", async () => {
	const electronApp = await _electron.launch({ args: ["compiled/main.js"], env: { CI: "true" } });
	try {
		const page = await electronApp.firstWindow();
		await page.waitForLoadState();
		await expect(page.locator(".cursor")).toBeVisible();

		await page.keyboard.press("x");
		await page.keyboard.press("Shift+^");
		await page.keyboard.press("2");
		await page.keyboard.press("ArrowRight");
		await page.keyboard.type("+1/3");
		await page.keyboard.press("Shift+(");
		await page.keyboard.type("alpha");
		await page.keyboard.press("Tab");
		await expect(page).toHaveScreenshot("math-components.png");

		await page.keyboard.press("Enter");
		await page.keyboard.press("Enter");
		await page.keyboard.type("ABABAB");

		await page.keyboard.press("ArrowLeft");
		await page.keyboard.press("ArrowLeft");
		await page.keyboard.press("Shift+ArrowLeft");
		await page.keyboard.press("Shift+ArrowLeft");
		await page.keyboard.press("Control+d");
		await expect(page).toHaveScreenshot("multi-cursoring.png");

		await page.keyboard.press("ArrowRight");
		await page.keyboard.type("xyz");
		await page.keyboard.press("Control+ArrowRight");
		await page.keyboard.type("123");
		await expect(page).toHaveScreenshot("typing-with-multicursors.png");

		await page.keyboard.press("Enter");
		await page.keyboard.type("abc");
		await page.keyboard.press("Shift+ArrowLeft");
		await page.keyboard.press("Shift+ArrowLeft");
		await page.keyboard.press("Shift+ArrowLeft");
		await page.keyboard.type("xyz");
		await expect(page).toHaveScreenshot("typing-with-selection.png");

		await page.keyboard.press("Enter");
		await page.keyboard.press("Shift+(");
		await page.keyboard.press("Shift+)");
		await expect(page).toHaveScreenshot("parenthese-pairs.png");

		await page.keyboard.press("Enter");
		await page.keyboard.press("a");
		await expect(page).toHaveScreenshot("autocomplete-ui.png");

		await page.keyboard.press("Enter");
		await page.keyboard.press("Enter");
		await page.keyboard.press("Enter");
		await page.keyboard.press("+");
		await expect(page).toHaveScreenshot("operator-after-empty-lines.png"); // regression test

		await page.keyboard.type("a".repeat(100));
		await page.mouse.move(600, 600);
		await page.mouse.down();
		await page.mouse.move(0, 600);
		await page.mouse.up();
		await expect(page).toHaveScreenshot("mouse-highlighting-multiline.png");

		await page.keyboard.press("ArrowRight");
		await expect(page).toHaveScreenshot("cleared-selection.png");
	}
	finally {
		electronApp.close();
	}
});
