import puppeteer, { type Browser } from "puppeteer";
import { type Browser as BrowserCore } from "puppeteer-core";
const puppeteerCore = require("puppeteer-core");
import chromium from "@sparticuz/chromium";
import { ExecutionEnvironment } from "@/types/executor";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");
    let browser: Browser | BrowserCore;
    console.log(
      "@process..........",
      process.env.NODE_ENV,
      process.env.VERCEL_ENV
    );
    if (
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL_ENV === "production"
    ) {
      console.log("Launching in production mode with @sparticuz/chromium...");
      // Optional font loading to avoid font rendering glitches on headless Linux
      // await chromium.font("https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf");

      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        // @ts-ignore
        ignoreHTTPSErrors: true,
      });
    } else {
      console.log("Launching in development mode...");
      const localExecutablePath =
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      browser = await puppeteer.launch({
        headless: true, //testing in headful modes
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: localExecutablePath,
      });
    }

    environment.log.info("Browser launched successfully.");
    environment.setBrowser(browser);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(websiteUrl, { waitUntil: "domcontentloaded" });
    environment.setPage(page);
    environment.log.info(`Opened the website successfully. URL:${websiteUrl}`);

    return true;
  } catch (e: any) {
    environment.log.error(`Failed to launch browser: ${e.message}`);
    console.error("Error while launching puppeteer:", e);
    return false;
  }
}
